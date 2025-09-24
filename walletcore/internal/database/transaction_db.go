package database

import (
	"context"

	"github.com/jnunes-ds/walletcore-fc/internal/entity"
)

type TransactionDB struct {
	DB DBTX
}

func NewTransactionDB(db DBTX) *TransactionDB {
	return &TransactionDB{
		DB: db,
	}
}

func (t *TransactionDB) Create(ctx context.Context, transaction *entity.Transaction) error {
	stmt, err := t.DB.PrepareContext(ctx, "INSERT INTO transactions (id, account_id_from, account_id_to, amount, created_at) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(transaction.ID, transaction.AccountFrom.ID, transaction.AccountTo.ID, transaction.Amount, transaction.CreatedAt)
	if err != nil {
		return err
	}
	return nil
}
