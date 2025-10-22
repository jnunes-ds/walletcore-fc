package event

import "time"

const AccountCreatedEvent = "AccountCreated"

type AccountCreated struct {
	Name    string
	Payload interface{}
}

func NewAccountCreated() *AccountCreated {
	return &AccountCreated{
		Name: AccountCreatedEvent,
	}
}

func (e *AccountCreated) GetName() string {
	return e.Name
}

func (e *AccountCreated) GetPayload() interface{} {
	return e.Payload
}

func (e *AccountCreated) SetPayload(payload interface{}) {
	e.Payload = payload
}

func (e *AccountCreated) GetDateTime() time.Time {
	return time.Now()
}
