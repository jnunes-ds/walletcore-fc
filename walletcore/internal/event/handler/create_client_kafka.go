package handler

import (
	"encoding/json"
	"log"
	"time"

	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_account"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_client"
	"github.com/jnunes-ds/walletcore-fc/pkg/events"
)

// UserCreatedPayload define a estrutura esperada para os dados do evento user_created.
type UserCreatedPayload struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// AccountCreatedPayloadDTO é o DTO para o payload do evento de criação de conta.
type AccountCreatedPayloadDTO struct {
	ID        string    `json:"id"`
	ClientID  string    `json:"client_id"`
	Balance   float64   `json:"balance"`
	CreatedAt time.Time `json:"created_at"`
}

// CreateClientKafkaHandler manipula a criação de clientes e suas contas a partir de mensagens do Kafka.
type CreateClientKafkaHandler struct {
	CreateClientUseCase  *create_client.CreateClientUsecase
	CreateAccountUseCase *create_account.CreateAccountUseCase
	EventDispatcher      events.EventDispatcherInterface
	AccountCreatedEvent  events.EventInterface
}

// NewCreateClientKafkaHandler cria uma nova instância de CreateClientKafkaHandler.
func NewCreateClientKafkaHandler(
	clientUseCase *create_client.CreateClientUsecase,
	accountUseCase *create_account.CreateAccountUseCase,
	eventDispatcher events.EventDispatcherInterface,
	accountCreatedEvent events.EventInterface,
) *CreateClientKafkaHandler {
	return &CreateClientKafkaHandler{
		CreateClientUseCase:  clientUseCase,
		CreateAccountUseCase: accountUseCase,
		EventDispatcher:      eventDispatcher,
		AccountCreatedEvent:  accountCreatedEvent,
	}
}

// Handle processa a mensagem do Kafka para criar um novo cliente e sua conta.
func (h *CreateClientKafkaHandler) Handle(message []byte, topic string) {
	log.Printf("CreateClientKafkaHandler received message from topic: %s", topic)

	var payload UserCreatedPayload
	if err := json.Unmarshal(message, &payload); err != nil {
		log.Printf("Error unmarshalling user_created message: %v", err)
		return
	}

	clientInput := create_client.CreateClientInputDTO{
		UserId: payload.ID,
		Name:   payload.Name,
		Email:  payload.Email,
	}

	clientOutput, err := h.CreateClientUseCase.Execute(clientInput)
	if err != nil {
		log.Printf("Error creating client from Kafka message: %v", err)
		return
	}

	accountInput := create_account.CreateAccountInputDTO{
		ClientId: clientOutput.ID,
	}

	account, err := h.CreateAccountUseCase.Execute(accountInput)
	if err != nil {
		log.Printf("Error creating account for client %s: %v", clientOutput.ID, err)
		return
	}

	// Dispara o evento de criação de conta.
	payloadDTO := AccountCreatedPayloadDTO{
		ID:        account.ID,
		ClientID:  account.Client.ID,
		Balance:   account.Balance,
		CreatedAt: account.CreatedAt,
	}
	h.AccountCreatedEvent.SetPayload(payloadDTO)
	h.EventDispatcher.Dispatch(h.AccountCreatedEvent)
}
