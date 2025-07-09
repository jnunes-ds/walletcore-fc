package gateway

import (
	"github.com/jnunes-ds/walletcore-fc/internal/entity"
)

type AccountGateway interface {
	Save(account *entity.Account) error
	FindById(id string) (*entity.Account, error)
}
