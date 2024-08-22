package main

import (
	"testing"

	"github.com/stretchr/testify/require"
)

type fiberMock struct{}

func (f fiberMock) Listen(addr string) error {
	return nil
}

func TestGetServerInitials(t *testing.T) {
	app, db, err := GetServerInitials()

	require.NoError(t, err)
	require.NotNil(t, app)
	require.NotNil(t, db)
}

func TestStartServer(t *testing.T) {
	StartServer(fiberMock{})
}
