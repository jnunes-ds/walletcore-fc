package handler

import (
	"fmt"
	"sync"

	"github.com/jnunes-ds/walletcore-fc/pkg/events"
	"github.com/jnunes-ds/walletcore-fc/pkg/kafka"
)

// AccountCreatedKafkaHandler é o manipulador para o evento de criação de conta.
type AccountCreatedKafkaHandler struct {
	Kafka *kafka.Producer
}

// NewAccountCreatedKafkaHandler cria uma nova instância do manipulador.
func NewAccountCreatedKafkaHandler(kafka *kafka.Producer) *AccountCreatedKafkaHandler {
	return &AccountCreatedKafkaHandler{
		Kafka: kafka,
	}
}

// Handle publica o evento de criação de conta no tópico Kafka 'account_created'.
func (h *AccountCreatedKafkaHandler) Handle(message events.EventInterface, wg *sync.WaitGroup) {
	defer wg.Done()
	h.Kafka.Publish(message, nil, "account_created")
	fmt.Println("AccountCreatedKafkaHandler called")
}
