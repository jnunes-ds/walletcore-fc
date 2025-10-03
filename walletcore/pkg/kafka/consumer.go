package kafka

import (
	"log"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
)

// KafkaHandler define a interface para um manipulador de mensagens Kafka.
type KafkaHandler interface {
	Handle(message []byte)
}

// Consume inicia um consumidor Kafka e processa as mensagens usando o manipulador fornecido.
func Consume(configMap ckafka.ConfigMap, topics []string, handler KafkaHandler) {
	// Cria um novo consumidor.
	consumer, err := ckafka.NewConsumer(&configMap)
	if err != nil {
		log.Fatalf("Failed to create consumer: %v", err)
	}
	defer consumer.Close()

	// Inscreve-se nos tópicos.
	if err := consumer.SubscribeTopics(topics, nil); err != nil {
		log.Fatalf("Failed to subscribe to topics: %v", err)
	}

	log.Printf("Kafka consumer started and subscribed to topics: %v", topics)

	// Faz a leitura das mensagens em um loop.
	for {
		msg, err := consumer.ReadMessage(-1)
		if err == nil {
			// Passa o valor da mensagem para o manipulador.
			handler.Handle(msg.Value)
		} else {
			// O cliente tentará se recuperar de erros automaticamente.
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
}
