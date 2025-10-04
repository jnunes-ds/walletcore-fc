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

// Handle processa a mensagem do Kafka, registrando seu conteúdo e o tópico no log.
func (h *LogKafkaHandler) Handle(message []byte, topic string) {
	log.Printf("Kafka message received - TOPIC (%s) - %s\n", topic, string(message))
}
