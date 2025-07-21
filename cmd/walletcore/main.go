package main

import (
	"database/sql"
	"fmt"
	"github.com/jnunes-ds/walletcore-fc/internal/database"
	"github.com/jnunes-ds/walletcore-fc/internal/event"
	create_account "github.com/jnunes-ds/walletcore-fc/internal/usecase/create_account"
	create_client "github.com/jnunes-ds/walletcore-fc/internal/usecase/create_client"
	create_transaction "github.com/jnunes-ds/walletcore-fc/internal/usecase/create_transaction"
	"github.com/jnunes-ds/walletcore-fc/pkg/events"

	_ "github.com/go-sql-driver/mysql"
)

func mian() {
	db, err := sql.Open("mysql", fmt.Sprint("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=true&loc=Local", "root", "root", "localhost", "3306", "wallet"))
	if err != nil {
		panic(err)
	}
	defer db.Close()

	eventDispatcher := events.NewEventDispatcher()
	transactionCreatedEvent := event.NewTransactionCreated()
	//eventDispatcher.Register("TransactionCreated", handler)

	clientDb := database.NewClientDB(db)
	accountDb := database.NewAccountDB(db)
	transactionDb := database.NewTransactionDB(db)

	createClientUseCase := create_client.NewCreateClientUsecase(clientDb)
	createAccountUseCase := create_account.NewCreateAccountUseCase(accountDb, clientDb)
	createTransactionUseCase := create_transaction.NewCreateTransactionUseCase(transactionDb, accountDb, eventDispatcher, transactionCreatedEvent)
}
