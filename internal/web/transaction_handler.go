package web

import (
	"encoding/json"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_transaction"
	"net/http"
)

type WebTransactionHandler struct {
	CreateTransactionUseCase create_transaction.CreateTransactionUseCase
}

func NewTransactionHandler(createTransactionUseCase create_transaction.CreateTransactionUseCase) *WebTransactionHandler {
	return &WebTransactionHandler{
		CreateTransactionUseCase: createTransactionUseCase,
	}
}

func (wth *WebTransactionHandler) CreateTransaction(res http.ResponseWriter, req *http.Request) {
	var input create_transaction.CreateTransactionInputDTO
	if err := json.NewDecoder(req.Body).Decode(&input); err != nil {
		res.WriteHeader(http.StatusBadRequest)
		return
	}

	output, err := wth.CreateTransactionUseCase.Execute(input)
	if err != nil {
		res.WriteHeader(http.StatusInternalServerError)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	if err = json.NewEncoder(res).Encode(output); err != nil {
		res.WriteHeader(http.StatusInternalServerError)
		return
	}

	res.WriteHeader(http.StatusCreated)
}
