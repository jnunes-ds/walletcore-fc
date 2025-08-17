package database

import (
	"database/sql"
	"github.com/jnunes-ds/walletcore-fc/internal/entity"
	"github.com/stretchr/testify/suite"
	"testing"
)

type AccountDBTestSuite struct {
	suite.Suite
	db        *sql.DB
	AccountDB *AccountDB
	client    *entity.Client
}

func (s *AccountDBTestSuite) SetupTest() {
	db, err := sql.Open("sqlite3", ":memory:")
	s.Nil(err)
	s.db = db
	db.Exec("CREATE  TABLE clients (id varchar(255), name varchar(255), email varchar(255), created_at date)")
	db.Exec("CREATE TABLE accounts (id varchar(255), client_id varchar(255), balance decimal(10,2), created_at date)")
	s.AccountDB = NewAccountDB(db)
	s.client, _ = entity.NewClient("Jhon", "jhon@email.com")
}

func (s *AccountDBTestSuite) TearDownTest() {
	defer s.db.Close()
	s.db.Exec("DROP TABLE clients")
	s.db.Exec("DROP TABLE accounts")
}

func TestAccountDBTestSuite(t *testing.T) {
	suite.Run(t, new(AccountDBTestSuite))
}

func (s *AccountDBTestSuite) TestSave() {
	account := entity.NewAccount(s.client)
	err := s.AccountDB.Save(account)
	s.Nil(err)
}

func (s *AccountDBTestSuite) TestGet() {
	s.db.Exec(
		"INSERT INTO clients (id, name, email, created_at) values ( ?, ?, ?, ? )",
		s.client.ID, s.client.Name, s.client.Email, s.client.CreatedAt,
	)
	account := entity.NewAccount(s.client)
	err := s.AccountDB.Save(account)
	s.Nil(err)
	accountDB, err := s.AccountDB.FindById(account.ID)
	s.Nil(err)
	s.Equal(account.ID, accountDB.ID)
	s.Equal(account.Client.ID, accountDB.Client.ID)
	s.Equal(account.Balance, accountDB.Balance)
}
