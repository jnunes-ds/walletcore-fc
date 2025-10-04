package handler

import (
	"encoding/json"
	"log"

	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_account"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_client"
)

// UserCreatedPayload define a estrutura esperada para os dados do evento user_created.
type UserCreatedPayload struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// CreateClientKafkaHandler manipula a criação de clientes e suas contas a partir de mensagens do Kafka.
type CreateClientKafkaHandler struct {
	CreateClientUseCase  *create_client.CreateClientUsecase
	CreateAccountUseCase *create_account.CreateAccountUseCase
}

// NewCreateClientKafkaHandler cria uma nova instância de CreateClientKafkaHandler.
func NewCreateClientKafkaHandler(clientUseCase *create_client.CreateClientUsecase, accountUseCase *create_account.CreateAccountUseCase) *CreateClientKafkaHandler {
	return &CreateClientKafkaHandler{
		CreateClientUseCase:  clientUseCase,
		CreateAccountUseCase: accountUseCase,
	}
}

// Handle processa a mensagem do Kafka para criar um novo cliente e sua conta.
func (h *CreateClientKafkaHandler) Handle(message []byte, topic string) {
	log.Printf("CreateClientKafkaHandler received message from topic: %s", topic)

	// Decodifica o payload da mensagem.
	var payload UserCreatedPayload
	if err := json.Unmarshal(message, &payload); err != nil {
		log.Printf("Error unmarshalling user_created message: %v", err)
		return
	}

	// Prepara os dados para o caso de uso de criação de cliente.
	clientInput := create_client.CreateClientInputDTO{
		UserId: payload.ID,
		Name:   payload.Name,
		Email:  payload.Email,
	}

	// Executa o caso de uso para criar o cliente.
	clientOutput, err := h.CreateClientUseCase.Execute(clientInput)
	if err != nil {
		log.Printf("Error creating client from Kafka message: %v", err)
		return
	}

	// Prepara os dados para o caso de uso de criação de conta.
	accountInput := create_account.CreateAccountInputDTO{
		ClientId: clientOutput.ID,
	}

	// Executa o caso de uso para criar a conta.
	if _, err := h.CreateAccountUseCase.Execute(accountInput); err != nil {
		log.Printf("Error creating account for client %s: %v", clientOutput.ID, err)
	}
}
