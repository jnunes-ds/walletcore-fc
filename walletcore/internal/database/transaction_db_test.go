package database

import (
	"database/sql"
	"github.com/jnunes-ds/walletcore-fc/internal/entity"
	"github.com/stretchr/testify/suite"
	"testing"
)

type TransactionDBTestSuite struct {
	suite.Suite
	db            *sql.DB
	client        *entity.Client
	client2       *entity.Client
	accountFrom   *entity.Account
	accountTo     *entity.Account
	transactionDB *TransactionDB
}

func (s *TransactionDBTestSuite) SetupSuite() {
	db, err := sql.Open("sqlite3", ":memory:")
	s.Nil(err)
	s.db = db
	db.Exec("CREATE TABLE clients (id varchar(255), name varchar(255), email varchar(255), created_at date)")
	db.Exec("CREATE TABLE accounts (id varchar(255), client_id varchar(255), balance decimal(10,2), created_at date)")
	db.Exec("CREATE TABLE transactions (id varchar(255), account_id_from varchar(255), account_id_to varchar(255), amount decimal(10,2), created_at date)")
	client, err := entity.NewClient("Jhon", "jhon@email.com")
	s.Nil(err)
	s.client = client
	client2, err := entity.NewClient("Jane", "jane@email.com")
	s.Nil(err)
	s.client2 = client2

	// creating accounts
	accountFrom := entity.NewAccount(s.client)
	accountFrom.Balance = 1000.0
	s.accountFrom = accountFrom
	accountTo := entity.NewAccount(s.client2)
	accountTo.Balance = 1000.0
	s.accountTo = accountTo

	s.transactionDB = NewTransactionDB(db)
}

func (s *TransactionDBTestSuite) TearDownSuite() {
	defer s.db.Close()
	s.db.Exec("DROP TABLE clients")
	s.db.Exec("DROP TABLE accounts")
	s.db.Exec("DROP TABLE transactions")
}

func TestTransactionDBTestSuite(t *testing.T) {
	suite.Run(t, new(TransactionDBTestSuite))
}

func (s *TransactionDBTestSuite) TestCreate() {
	transaction, err := entity.NewTransaction(s.accountFrom, s.accountTo, 100.0)
	s.Nil(err)
	err = s.transactionDB.Create(transaction)
	s.Nil(err)
}
