package create_transaction

import (
	"context"

	"github.com/jnunes-ds/walletcore-fc/internal/entity"
	"github.com/jnunes-ds/walletcore-fc/internal/gateway"
	"github.com/jnunes-ds/walletcore-fc/pkg/events"
	"github.com/jnunes-ds/walletcore-fc/pkg/uow"
)

// CreateTransactionInputDTO é o DTO de entrada para a criação de transações.
type CreateTransactionInputDTO struct {
	AccountIdFrom string  `json:"account_id_from"`
	AccountIdTo   string  `json:"account_id_to"`
	Amount        float64 `json:"amount"`
}

// CreateTransactionOutputDTO é o DTO de saída, usado como payload do evento.
type CreateTransactionOutputDTO struct {
	ID            string  `json:"id"`
	AccountIDFrom string  `json:"account_id_from"`
	AccountIDTo   string  `json:"account_id_to"`
	UserIDFrom    string  `json:"user_id_from"`
	UserIDTo      string  `json:"user_id_to"`
	Amount        float64 `json:"amount"`
}

// BalanceUpdatedOutputDTO é o DTO para o evento de atualização de saldo.
type BalanceUpdatedOutputDTO struct {
	AccountIDFrom        string  `json:"account_id_from"`
	AccountIDTo          string  `json:"account_id_to"`
	BalanceAccountIDFrom float64 `json:"balance_account_id_from"`
	BalanceAccountIDTo   float64 `json:"balance_account_id_to"`
}

// CreateTransactionUseCase define o caso de uso para criar uma transação.
type CreateTransactionUseCase struct {
	Uow                uow.UowInterface
	EventDispatcher    events.EventDispatcherInterface
	TransactionCreated events.EventInterface
	BalanceUpdated     events.EventInterface
}

// NewCreateTransactionUseCase cria uma nova instância do caso de uso.
func NewCreateTransactionUseCase(
	Uow uow.UowInterface,
	eventDispatcher events.EventDispatcherInterface,
	transactionCreated events.EventInterface,
	balanceUpdated events.EventInterface,
) *CreateTransactionUseCase {
	return &CreateTransactionUseCase{
		Uow:                Uow,
		EventDispatcher:    eventDispatcher,
		TransactionCreated: transactionCreated,
		BalanceUpdated:     balanceUpdated,
	}
}

// Execute orquestra a criação da transação e o disparo de eventos.
func (uc *CreateTransactionUseCase) Execute(ctx context.Context, input CreateTransactionInputDTO) (*CreateTransactionOutputDTO, error) {
	output := &CreateTransactionOutputDTO{}
	balanceUpdatedOutput := &BalanceUpdatedOutputDTO{}

	err := uc.Uow.Do(ctx, func(_ *uow.Uow) error {
		accountRepository := uc.getAccountRepository(ctx)
		transactionRepository := uc.getTransactionRepository(ctx)

		accountFrom, err := accountRepository.FindById(input.AccountIdFrom)
		if err != nil {
			return err
		}
		accountTo, err := accountRepository.FindById(input.AccountIdTo)
		if err != nil {
			return err
		}

		transaction, err := entity.NewTransaction(accountFrom, accountTo, input.Amount)
		if err != nil {
			return err
		}

		if err = accountRepository.UpdateBalance(accountFrom); err != nil {
			return err
		}

		if err = accountRepository.UpdateBalance(accountTo); err != nil {
			return err
		}

		if err = transactionRepository.Create(transaction); err != nil {
			return err
		}

		// Preenche o DTO de saída com os IDs de usuário.
		output.ID = transaction.ID
		output.AccountIDFrom = input.AccountIdFrom
		output.AccountIDTo = input.AccountIdTo
		output.UserIDFrom = accountFrom.Client.UserId
		output.UserIDTo = accountTo.Client.UserId
		output.Amount = input.Amount

		balanceUpdatedOutput.AccountIDFrom = input.AccountIdFrom
		balanceUpdatedOutput.AccountIDTo = input.AccountIdTo
		balanceUpdatedOutput.BalanceAccountIDFrom = accountFrom.Balance
		balanceUpdatedOutput.BalanceAccountIDTo = accountTo.Balance
		return nil
	})

	if err != nil {
		return nil, err
	}

	uc.TransactionCreated.SetPayload(output)
	uc.EventDispatcher.Dispatch(uc.TransactionCreated)

	uc.BalanceUpdated.SetPayload(balanceUpdatedOutput)
	uc.EventDispatcher.Dispatch(uc.BalanceUpdated)
	return output, nil
}

func (uc *CreateTransactionUseCase) getAccountRepository(ctx context.Context) gateway.AccountGateway {
	repo, err := uc.Uow.GetRepository(ctx, "AccountDB")
	if err != nil {
		panic(err)
	}
	return repo.(gateway.AccountGateway)
}

func (uc *CreateTransactionUseCase) getTransactionRepository(ctx context.Context) gateway.TransactionGateway {
	repo, err := uc.Uow.GetRepository(ctx, "TransactionDB")
	if err != nil {
		panic(err)
	}
	return repo.(gateway.TransactionGateway)
}
