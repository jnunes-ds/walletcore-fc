package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"os"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jnunes-ds/walletcore-fc/internal/database"
	"github.com/jnunes-ds/walletcore-fc/internal/event"
	"github.com/jnunes-ds/walletcore-fc/internal/event/handler"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_account"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_client"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_transaction"
	"github.com/jnunes-ds/walletcore-fc/internal/web"
	"github.com/jnunes-ds/walletcore-fc/internal/web/webserver"
	"github.com/jnunes-ds/walletcore-fc/pkg/events"
	"github.com/jnunes-ds/walletcore-fc/pkg/kafka"
	"github.com/jnunes-ds/walletcore-fc/pkg/uow"
)

func createTables(db *sql.DB) error {
	// Usamos uma transação para garantir que todas as tabelas sejam criadas ou nenhuma seja.
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback() // Desfaz em caso de erro.

	// Tabela de Clientes
	_, err = tx.Exec(`
		CREATE TABLE IF NOT EXISTS clients (
			id VARCHAR(255) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			created_at TIMESTAMP NOT NULL
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create clients table: %w", err)
	}

	// Tabela de Contas
	_, err = tx.Exec(`
		CREATE TABLE IF NOT EXISTS accounts (
			id VARCHAR(255) PRIMARY KEY,
			client_id VARCHAR(255) NOT NULL,
			balance DECIMAL(18, 2) NOT NULL,
			created_at TIMESTAMP NOT NULL,
			FOREIGN KEY (client_id) REFERENCES clients(id)
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create accounts table: %w", err)
	}

	// Tabela de Transações
	_, err = tx.Exec(`
		CREATE TABLE IF NOT EXISTS transactions (
			id VARCHAR(255) PRIMARY KEY,
			account_id_from VARCHAR(255) NOT NULL,
			account_id_to VARCHAR(255) NOT NULL,
			amount DECIMAL(18, 2) NOT NULL,
			created_at TIMESTAMP NOT NULL,
			FOREIGN KEY (account_id_from) REFERENCES accounts(id),
			FOREIGN KEY (account_id_to) REFERENCES accounts(id)
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create transactions table: %w", err)
	}

	return tx.Commit() // Confirma a transação se tudo correu bem.
}

func main() {
	// 1. Lê e parseia a DATABASE_URL do ambiente para criar o DSN.
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}
	parsedURL, err := url.Parse(dbURL)
	if err != nil {
		log.Fatalf("Cannot parse DATABASE_URL: %v", err)
	}
	password, _ := parsedURL.User.Password()
	dsn := fmt.Sprintf("%s:%s@tcp(%s)%s?charset=utf8&parseTime=true&loc=Local", parsedURL.User.Username(), password, parsedURL.Host, parsedURL.Path)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("failed to open database connection: %v", err)
	}
	defer db.Close()

	// 2. Cria as tabelas no banco de dados se elas não existirem.
	if err := createTables(db); err != nil {
		log.Fatalf("failed to create tables: %v", err)
	}

	configMap := ckafka.ConfigMap{
		"bootstrap.servers": "kafka:29092",
		"group.id":          "wallet",
	}

	kafkaProducer := kafka.NewKafkaProducer(&configMap)

	eventDispatcher := events.NewEventDispatcher()
	transactionCreatedEvent := event.NewTransactionCreated()
	eventDispatcher.Register(transactionCreatedEvent.GetName(), handler.NewTransactionCreatedKafkaHandler(kafkaProducer))
	eventDispatcher.Register("BalanceUpdated", handler.NewUpdateBalanceKafkaHandler(kafkaProducer))
	balanceUpdatedEvent := event.NewBalanceUpdated()
	//eventDispatcher.Register("TransactionCreated", handler)

	clientDb := database.NewClientDB(db)
	accountDb := database.NewAccountDB(db)

	ctx := context.Background()
	uow := uow.NewUow(ctx, db)

	// 3. CORREÇÃO: Registra os repositórios para usar a transação (tx) em vez da conexão global (db).
	uow.Register("AccountDB", func(tx *sql.Tx) interface{} {
		return database.NewAccountDB(db)
	})

	uow.Register("TransactionDB", func(tx *sql.Tx) interface{} {
		return database.NewTransactionDB(db)
	})

	createClientUseCase := create_client.NewCreateClientUsecase(clientDb)
	createAccountUseCase := create_account.NewCreateAccountUseCase(accountDb, clientDb)
	createTransactionUseCase := create_transaction.NewCreateTransactionUseCase(uow, eventDispatcher, transactionCreatedEvent, balanceUpdatedEvent)

	webserver := webserver.NewWebServer(":8080")

	clientHandler := web.NewWebClientHandler(*createClientUseCase)
	accountHandler := web.NewWebAccountHandler(*createAccountUseCase)
	transactionHandler := web.NewTransactionHandler(*createTransactionUseCase)

	webserver.AddHandler("/clients", clientHandler.CreateClient)
	webserver.AddHandler("/accounts", accountHandler.CreateAccount)
	webserver.AddHandler("/transactions", transactionHandler.CreateTransaction)

	// 4. Inicia o servidor web de forma bloqueante e trata o erro.
	fmt.Println("Server is running")
	if err := webserver.Start(); err != nil {
		log.Fatalf("Could not start web server: %v", err)
	}
}
