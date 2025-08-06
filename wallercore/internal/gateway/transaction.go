package gateway

import "github.com/jnunes-ds/walletcore-fc/internal/entity"

type TransactionGateway interface {
	Create(transaction *entity.Transaction) error
}
