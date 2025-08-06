package main

import (
	"context"
	"database/sql"
	"fmt"
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

func main() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=true&loc=Local", "root", "root", "mysql", "3306", "wallet")
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}
	defer db.Close()

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

	fmt.Println("Server is running")
	webserver.Start()
}
