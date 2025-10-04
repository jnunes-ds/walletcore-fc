package create_client

import (
	"time"

	"github.com/jnunes-ds/walletcore-fc/internal/entity"
	"github.com/jnunes-ds/walletcore-fc/internal/gateway"
)

// CreateClientInputDTO define o DTO para a criação de um cliente.
type CreateClientInputDTO struct {
	ID     string
	UserId string `json:"user_id"`
	Name   string
	Email  string
}

type CreateClientOutputDTO struct {
	ID        string
	UserId    string `json:"user_id"`
	Name      string
	Email     string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type CreateClientUsecase struct {
	ClientGateway gateway.ClientGateway
}

func NewCreateClientUsecase(clientGateway gateway.ClientGateway) *CreateClientUsecase {
	return &CreateClientUsecase{
		ClientGateway: clientGateway,
	}
}

// Execute cria um cliente, usando um ID existente se fornecido.
func (uc *CreateClientUsecase) Execute(input CreateClientInputDTO) (*CreateClientOutputDTO, error) {
	var client *entity.Client
	var err error

	if input.ID != "" {
		client, err = entity.NewClientWithID(input.ID, input.Name, input.Email, input.UserId)
	} else {
		client, err = entity.NewClient(input.Name, input.Email, input.UserId)
	}

	if err != nil {
		return nil, err
	}

	if err = uc.ClientGateway.Save(client); err != nil {
		return nil, err
	}

	return &CreateClientOutputDTO{
		ID:        client.ID,
		Name:      client.Name,
		Email:     client.Email,
		CreatedAt: client.CreatedAt,
		UpdatedAt: client.UpdatedAt,
	}, nil
}
