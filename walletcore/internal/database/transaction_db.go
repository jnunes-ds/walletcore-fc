package database

import (
	"github.com/jnunes-ds/walletcore-fc/internal/entity"
	"github.com/jnunes-ds/walletcore-fc/internal/gateway"
)

// Garante em tempo de compilação que TransactionDB implementa TransactionGateway.
var _ gateway.TransactionGateway = (*TransactionDB)(nil)

type TransactionDB struct {
	DB DBTX
}

func NewTransactionDB(db DBTX) *TransactionDB {
	return &TransactionDB{
		DB: db,
	}
}

// Create salva uma transação no banco de dados.
func (t *TransactionDB) Create(transaction *entity.Transaction) error {
	stmt, err := t.DB.Prepare("INSERT INTO transactions (id, account_id_from, account_id_to, amount, created_at) VALUES (?, ?, ?, ?, ?)")
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
