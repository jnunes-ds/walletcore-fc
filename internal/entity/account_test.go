package entity

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestCreateAccount(t *testing.T) {
	client, _ := NewClient("John Doe", "jhon@email.com")
	account := NewAccount(client)
	assert.NotNil(t, account)
	assert.Equal(t, client.ID, account.Client.ID)
}

func TestCreateAccountWithNilClient(t *testing.T) {
	account := NewAccount(nil)
	assert.Nil(t, account)
}

func TestCreditAccount(t *testing.T) {
	client, _ := NewClient("John Doe", "jhon@email.com")
	account := NewAccount(client)
	account.Credit(100.0)
	assert.Equal(t, 100.0, account.Balance)
}

func TestDebittAccount(t *testing.T) {
	client, _ := NewClient("John Doe", "jhon@email.com")
	account := NewAccount(client)
	account.Credit(100.0)
	account.Debit(50.0)
	assert.Equal(t, 50.0, account.Balance)
}

func TestAddAccountToClient(t *testing.T) {
	client, _ := NewClient("John Doe", "jhon@email.com")
	accont := NewAccount(client)
	err := client.AddAccount(accont)
	assert.Nil(t, err)
	assert.Equal(t, 1, len(client.Accounts))
}
