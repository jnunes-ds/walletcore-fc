package entity

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestCreateTransaction(t *testing.T) {
	client1, _ := NewClient("Jhon Doe", "jhon@email.com")
	account1 := NewAccount(client1)
	client2, _ := NewClient("Jane Doe", "jano@email.com")
	account2 := NewAccount(client2)

	account1.Credit(1000.0)
	account2.Credit(1000.0)

	transaction, err := NewTransaction(account1, account2, 100.0)
	assert.Nil(t, err)
	assert.NotNil(t, transaction)
	assert.Equal(t, 1100.0, account2.Balance)
	assert.Equal(t, 900.0, account1.Balance)
}

func TestCreateTransactionWithInsifficientFounds(t *testing.T) {
	client1, _ := NewClient("Jhon Doe", "jhon@email.com")
	account1 := NewAccount(client1)
	client2, _ := NewClient("Jane Doe", "jane@email.com")
	account2 := NewAccount(client2)

	account1.Credit(1000.0)
	account2.Credit(1000.0)

	transaction, err := NewTransaction(account1, account2, 2000.0)
	assert.NotNil(t, err)
	assert.Error(t, err, "insufficient funds in the source account")
	assert.Nil(t, transaction)
	assert.Equal(t, 1000.0, account2.Balance)
	assert.Equal(t, 1000.0, account1.Balance)
}
