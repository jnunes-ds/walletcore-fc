package database

import (
	"database/sql"
	"testing"

	"github.com/jnunes-ds/walletcore-fc/internal/entity"
	_ "github.com/mattn/go-sqlite3"
	"github.com/stretchr/testify/suite"
)

type ClientDBTEstSuite struct {
	suite.Suite
	db       *sql.DB
	clientDB *ClientDB
}

func (s *ClientDBTEstSuite) SetupSuite() {
	db, err := sql.Open("sqlite3", ":memory:")
	s.Nil(err)
	s.db = db
	db.Exec("CREATE TABLE clients (id varchar(255), user_id varchar(255), name varchar(255), email varchar(255), created_at date)")
	s.clientDB = NewClientDB(db)
}

func (s *ClientDBTEstSuite) TearDownSuite() {
	defer s.db.Close()
	s.db.Exec("DROP TABLE clients")
}

func TestClientDBTestSuite(t *testing.T) {
	suite.Run(t, new(ClientDBTEstSuite))
}

func (s *ClientDBTEstSuite) TestSave() {
	client, _ := entity.NewClient("Jhon", "jhon@email.com", "123")
	err := s.clientDB.Save(client)
	s.Nil(err)
}

func (s *ClientDBTEstSuite) TestGet() {
	client, _ := entity.NewClient("Jhon", "jhon@email.com", "123")
	s.clientDB.Save(client)

	clientDB, err := s.clientDB.Get(client.ID)
	s.Nil(err)
	s.Equal(client.ID, clientDB.ID)
	s.Equal(client.Name, clientDB.Name)
}
