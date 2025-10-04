package handler

import (
	"fmt"
	"sync"

	"github.com/jnunes-ds/walletcore-fc/pkg/events"
	"github.com/jnunes-ds/walletcore-fc/pkg/kafka"
)

type UserCreatedKafkaHandler struct {
	Kafka *kafka.Producer
}

func NewUserCreatedKafkaHandler(kafka *kafka.Producer) *UserCreatedKafkaHandler {
	return &UserCreatedKafkaHandler{
		Kafka: kafka,
	}
}

func (h *UserCreatedKafkaHandler) Handle(message events.EventInterface, wg *sync.WaitGroup) {
	defer wg.Done()
	h.Kafka.Publish(message, nil, "users")
	fmt.Println("User Created Kafka Handler - Go App")
}
