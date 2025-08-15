package web

import (
	"encoding/json"
	"github.com/jnunes-ds/walletcore-fc/internal/usecase/create_account"
	"net/http"
)

type WebAccountHandler struct {
	CreateAccountUseCase create_account.CreateAccountUseCase
}

func NewWebAccountHandler(createAccountUseCase create_account.CreateAccountUseCase) *WebAccountHandler {
	return &WebAccountHandler{
		CreateAccountUseCase: createAccountUseCase,
	}
}

func (wah *WebAccountHandler) CreateAccount(res http.ResponseWriter, req *http.Request) {
	var input create_account.CreateAccountInputDTO
	if err := json.NewDecoder(req.Body).Decode(&input); err != nil {
		res.WriteHeader(http.StatusBadRequest)
		return
	}

	output, err := wah.CreateAccountUseCase.Execute(input)
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
