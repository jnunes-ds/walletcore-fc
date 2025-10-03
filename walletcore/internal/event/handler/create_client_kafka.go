package handler

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_client"
)

// CreateClientKafkaHandler é responsável por manipular eventos de criação de cliente do Kafka.
type CreateClientKafkaHandler struct {
	CreateClientUseCase *create_client.CreateClientUsecase
}

// NewCreateClientKafkaHandler cria uma nova instância de CreateClientKafkaHandler.
func NewCreateClientKafkaHandler(createClientUseCase *create_client.CreateClientUsecase) *CreateClientKafkaHandler {
	return &CreateClientKafkaHandler{
		CreateClientUseCase: createClientUseCase,
	}
}

// Handle processa a mensagem do Kafka, cria um novo cliente e o salva no banco de dados.
func (h *CreateClientKafkaHandler) Handle(message []byte) {
	// DTO para o payload do evento "user_created"
	var dto struct {
		Payload struct {
			ID    string `json:"id"`
			Name  string `json:"name"`
			Email string `json:"email"`
		} `json:"Payload"`
	}

	// Faz o unmarshal da mensagem JSON
	if err := json.Unmarshal(message, &dto); err != nil {
		log.Printf("Error unmarshalling kafka message: %v", err)
		return
	}

	// Prepara o DTO de entrada para o caso de uso
	inputDto := create_client.CreateClientInputDTO{
		ID:    dto.Payload.ID,
		Name:  dto.Payload.Name,
		Email: dto.Payload.Email,
	}

	// Executa o caso de uso para criar o cliente
	if _, err := h.CreateClientUseCase.Execute(inputDto); err != nil {
		log.Printf("Error executing create client use case: %v", err)
		return
	}

	fmt.Printf("Client created: %s (%s)\n", dto.Payload.Name, dto.Payload.Email)
}
