package web

import (
	"encoding/json"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_client"
	"net/http"
)

type WebClientHandler struct {
	CreateClientUseCase create_client.CreateClientUsecase
}

func NewWebClientHandler(createClientUseCase create_client.CreateClientUsecase) *WebClientHandler {
	return &WebClientHandler{
		CreateClientUseCase: createClientUseCase,
	}
}

func (wch *WebClientHandler) CreateClient(res http.ResponseWriter, req *http.Request) {

	var input create_client.CreateClientInputDTO
	if err := json.NewDecoder(req.Body).Decode(&input); err != nil {
		res.WriteHeader(http.StatusBadRequest)
		return
	}

	output, err := wch.CreateClientUseCase.Execute(input)
	if err != nil {
		http.Error(res, err.Error(), http.StatusInternalServerError)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(http.StatusCreated)
	json.NewEncoder(res).Encode(output)
}
