package handler

import (
	"fmt"
	"sync"

	"github.com/jnunes-ds/walletcore-fc/pkg/events"
	"github.com/jnunes-ds/walletcore-fc/pkg/kafka"
)

// TransactionCreatedKafkaHandler é o manipulador para o evento de criação de transação.
type TransactionCreatedKafkaHandler struct {
	Kafka *kafka.Producer
}

// NewTransactionCreatedKafkaHandler cria uma nova instância do manipulador.
func NewTransactionCreatedKafkaHandler(kafka *kafka.Producer) *TransactionCreatedKafkaHandler {
	return &TransactionCreatedKafkaHandler{
		Kafka: kafka,
	}
}

// Handle publica o evento de criação de transação no tópico Kafka 'transactions'.
func (h *TransactionCreatedKafkaHandler) Handle(message events.EventInterface, wg *sync.WaitGroup) {
	defer wg.Done()
	h.Kafka.Publish(message, nil, "transactions")
	fmt.Println("TransactionCreatedKafkaHandler called")
}
