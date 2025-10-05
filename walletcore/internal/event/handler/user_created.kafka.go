package handler

import (
	"fmt"
	"github.com/jnunes-ds/walletcore-fc/pkg/events"
	"github.com/jnunes-ds/walletcore-fc/pkg/kafka"
	"sync"
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
	h.Kafka.Publish(message, nil, "user_created")
	fmt.Println("UserCreatedKafkaHandler called")
}
