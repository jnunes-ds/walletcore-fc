package entity

import (
	"errors"
	"github.com/google/uuid"
	"time"
)

type Transaction struct {
	ID          string
	AccountFrom *Account
	AccountTo   *Account
	Amount      float64
	createdAt   time.Time
}

func NewTransaction(accountFrom *Account, accountTo *Account, amount float64) (*Transaction, error) {

	transaction := &Transaction{
		ID:          uuid.New().String(),
		AccountFrom: accountFrom,
		AccountTo:   accountTo,
		Amount:      amount,
		createdAt:   time.Now(),
	}

	err := transaction.Validate()

	if err != nil {
		return nil, err
	}
	transaction.Commit()
	return transaction, nil
}

func (t *Transaction) Commit() {
	t.AccountFrom.Debit(t.Amount)
	t.AccountTo.Credit(t.Amount)
}

func (c *Transaction) Validate() error {
	if c.AccountFrom == nil || c.AccountTo == nil {
		return errors.New("both accounts must be provided")
	}
	if c.Amount <= 0 {
		return errors.New("amount must be greater than zero")
	}
	if c.AccountFrom.Balance < c.Amount {
		return errors.New("insufficient funds in the source account")
	}
	return nil
}
