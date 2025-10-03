package handler

import (
	"log"
)

// LogKafkaHandler é um manipulador simples que registra as mensagens recebidas do Kafka.
type LogKafkaHandler struct{}

// NewLogKafkaHandler cria uma nova instância de LogKafkaHandler.
func NewLogKafkaHandler() *LogKafkaHandler {
	return &LogKafkaHandler{}
}

// Handle processa a mensagem do Kafka, apenas registrando seu conteúdo no log.
func (h *LogKafkaHandler) Handle(message []byte) {
	log.Printf("Kafka message received: %s\n", string(message))
}
