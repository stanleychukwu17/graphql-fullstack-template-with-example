package main

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSetup(t *testing.T) {
	// Set environment variable for testing
	// os.Setenv("PORT", "4000")

	// call setup function
	app, db, err := setup()

	// check if setup was successful
	require.NoError(t, err)
	require.NotNil(t, app)
	require.NotNil(t, db)
}
