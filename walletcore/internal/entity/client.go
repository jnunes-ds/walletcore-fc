package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Client struct {
	ID        string
	UserId    string
	Name      string
	Email     string
	Accounts  []*Account
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewClient(name string, email string, userId string) (*Client, error) {
	client := &Client{
		ID:        uuid.New().String(),
		UserId:    userId,
		Name:      name,
		Email:     email,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := client.Validade()

	if err != nil {
		return nil, err
	}

	return client, nil
}

// NewClientWithID cria um novo cliente com um ID fornecido.
func NewClientWithID(id, name, email string, userId string) (*Client, error) {
	client := &Client{
		ID:        id,
		UserId:    userId,
		Name:      name,
		Email:     email,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := client.Validade(); err != nil {
		return nil, err
	}

	return client, nil
}

func (c *Client) Validade() error {
	if c.ID == "" {
		return errors.New("id is required")
	}
	if c.UserId == "" {
		return errors.New("user_id is required")
	}
	if c.Name == "" {
		return errors.New("name is required")
	}
	if c.Email == "" {
		return errors.New("email is required")
	}
	return nil
}

func (c *Client) Update(name string, email string) error {
	c.Name = name
	c.Email = email
	c.CreatedAt = time.Now()
	err := c.Validade()
	if err != nil {
		return err
	}
	return nil
}
func (c *Client) AddAccount(account *Account) error {
	if account.Client.ID != c.ID {
		return errors.New("Account does not belong to this client")
	}
	c.Accounts = append(c.Accounts, account)
	return nil
}
