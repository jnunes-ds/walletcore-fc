package entity

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestCreateNewClient(t *testing.T) {
	client, err := NewClient("Jhon Doe", "jhon@email.com")
	assert.Nil(t, err)
	assert.NotNil(t, client)
	assert.Equal(t, "Jhon Doe", client.Name)
	assert.Equal(t, "jhon@email.com", client.Email)
}

func TestCreateNewClientWhenArgsAreInvalid(t *testing.T) {
	client, err := NewClient("", "")
	assert.NotNil(t, err)
	assert.Nil(t, client)
}

func TestUpdateClient(t *testing.T) {
	client, _ := NewClient("Jhon Doe", "jhon@email.com")
	err := client.Update("Jane Doe Updated", "updated_jhon@email.com")
	assert.Nil(t, err)
	assert.Equal(t, "Jane Doe Updated", client.Name)
	assert.Equal(t, "updated_jhon@email.com", client.Email)
}

func TestUpdateClientWithInvalidArgs(t *testing.T) {
	client, _ := NewClient("Jhon Doe", "jhon@email.com")
	err := client.Update("", "updated_jhon@email.com")
	assert.Error(t, err)
}
