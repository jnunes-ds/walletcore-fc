package handler

import (
	"context"
	"encoding/json"
	"log"

	"github.com/jnunes-ds/walletcore-fc/internal/database"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_transaction"
)

// ProductPurchasedPayload define a estrutura para o evento product_purchased.
type ProductPurchasedPayload struct {
	SellerID string  `json:"sellerId"`
	BuyerID  string  `json:"buyerId"`
	Price    float64 `json:"price"`
}

// CreateTransactionKafkaHandler manipula a criação de transações a partir de mensagens do Kafka.
type CreateTransactionKafkaHandler struct {
	CreateTransactionUseCase *create_transaction.CreateTransactionUseCase
	ClientDB                 *database.ClientDB
	AccountDB                *database.AccountDB
}

// NewCreateTransactionKafkaHandler cria uma nova instância de CreateTransactionKafkaHandler.
func NewCreateTransactionKafkaHandler(
	useCase *create_transaction.CreateTransactionUseCase,
	clientDB *database.ClientDB,
	accountDB *database.AccountDB,
) *CreateTransactionKafkaHandler {
	return &CreateTransactionKafkaHandler{
		CreateTransactionUseCase: useCase,
		ClientDB:                 clientDB,
		AccountDB:                accountDB,
	}
}

// Handle processa a mensagem do Kafka para criar uma nova transação.
func (h *CreateTransactionKafkaHandler) Handle(message []byte, topic string) {
	if topic != "product_purchased" {
		return
	}

	log.Printf("CreateTransactionKafkaHandler received message from topic: %s", topic)

	var payload ProductPurchasedPayload
	if err := json.Unmarshal(message, &payload); err != nil {
		log.Printf("Error unmarshalling product_purchased message: %v", err)
		return
	}

	// Busca a conta do vendedor.
	sellerClient, err := h.ClientDB.GetByUserID(payload.SellerID)
	if err != nil {
		log.Printf("Error getting seller client by user ID %s: %v", payload.SellerID, err)
		return
	}
	sellerAccount, err := h.AccountDB.FindByClientID(sellerClient.ID)
	if err != nil {
		log.Printf("Error getting seller account by client ID %s: %v", sellerClient.ID, err)
		return
	}

	// Busca a conta do comprador.
	buyerClient, err := h.ClientDB.GetByUserID(payload.BuyerID)
	if err != nil {
		log.Printf("Error getting buyer client by user ID %s: %v", payload.BuyerID, err)
		return
	}
	buyerAccount, err := h.AccountDB.FindByClientID(buyerClient.ID)
	if err != nil {
		log.Printf("Error getting buyer account by client ID %s: %v", buyerClient.ID, err)
		return
	}

	input := create_transaction.CreateTransactionInputDTO{
		AccountIdFrom: buyerAccount.ID,
		AccountIdTo:   sellerAccount.ID,
		Amount:        payload.Price,
	}

	ctx := context.Background()
	if _, err := h.CreateTransactionUseCase.Execute(ctx, input); err != nil {
		log.Printf("Error creating transaction: %v", err)
	}
}
