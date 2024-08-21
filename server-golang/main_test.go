package main

import (
	"fmt"
	"os"
	"reflect"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSetup(t *testing.T) {
	// Set environment variable for testing
	os.Setenv("PORT", "4000")

	app, db, err := setup()

	fmt.Printf("%+v \n", reflect.TypeOf(app))

	require.NoError(t, err)
	require.NotNil(t, app)
	require.NotNil(t, db)

	// Optionally, you can check more details about the app or db
	// For example, if you have specific methods or properties
	// assert.Equal(t, expected, actual)
}
