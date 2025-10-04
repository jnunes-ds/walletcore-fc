package handler

import (
	"encoding/json"
	"log"

	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_client"
)

// UserCreatedPayload define a estrutura esperada para os dados do evento user_created.
type UserCreatedPayload struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// CreateClientKafkaHandler manipula a criação de clientes a partir de mensagens do Kafka.
type CreateClientKafkaHandler struct {
	CreateClientUsecase *create_client.CreateClientUsecase
}

// NewCreateClientKafkaHandler cria uma nova instância de CreateClientKafkaHandler.
func NewCreateClientKafkaHandler(useCase *create_client.CreateClientUsecase) *CreateClientKafkaHandler {
	return &CreateClientKafkaHandler{
		CreateClientUsecase: useCase,
	}
}

// Handle processa a mensagem do Kafka para criar um novo cliente.
func (h *CreateClientKafkaHandler) Handle(message []byte, topic string) {

	log.Printf("CreateClientKafkaHandler received message from topic: %s", topic)

	// Decodifica o payload da mensagem.
	var payload UserCreatedPayload
	if err := json.Unmarshal(message, &payload); err != nil {
		log.Printf("Error unmarshalling user_created message: %v", err)
		return
	}

	// Prepara os dados para o caso de uso de criação de cliente.
	input := create_client.CreateClientInputDTO{
		UserId: payload.ID, // Usa o ID do evento como UserId do cliente.
		Name:   payload.Name,
		Email:  payload.Email,
	}

	// Executa o caso de uso para criar o cliente.
	if _, err := h.CreateClientUsecase.Execute(input); err != nil {
		log.Printf("Error creating client from Kafka message: %v", err)
	}
}
