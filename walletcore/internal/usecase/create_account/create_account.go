package create_account

import (
	"time"

	"github.com/jnunes-ds/walletcore-fc/internal/entity"
	"github.com/jnunes-ds/walletcore-fc/internal/gateway"
)

// CreateAccountInputDTO define o DTO para a entrada de criação de conta.
type CreateAccountInputDTO struct {
	ClientId string  `json:"client_id"`
	Balance  float64 `json:"balance"`
}

// AccountCreatedPayloadDTO é o payload para o evento AccountCreated.
type AccountCreatedPayloadDTO struct {
	ID        string    `json:"id"`
	ClientID  string    `json:"client_id"`
	UserID    string    `json:"user_id"`
	Balance   float64   `json:"balance"`
	CreatedAt time.Time `json:"created_at"`
}

// CreateAccountUseCase define o caso de uso para criação de conta.
type CreateAccountUseCase struct {
	AccountGateway gateway.AccountGateway
	ClientGateway  gateway.ClientGateway
}

// NewCreateAccountUseCase cria uma nova instância do caso de uso.
func NewCreateAccountUseCase(a gateway.AccountGateway, c gateway.ClientGateway) *CreateAccountUseCase {
	return &CreateAccountUseCase{
		AccountGateway: a,
		ClientGateway:  c,
	}
}

// Execute cria uma nova conta para um cliente e retorna a entidade da conta.
func (uc *CreateAccountUseCase) Execute(input CreateAccountInputDTO) (*entity.Account, error) {
	client, err := uc.ClientGateway.Get(input.ClientId)
	if err != nil {
		return nil, err
	}

	account := entity.NewAccount(client)
	account.Balance = input.Balance
	if err := uc.AccountGateway.Save(account); err != nil {
		return nil, err
	}

	return account, nil
}
