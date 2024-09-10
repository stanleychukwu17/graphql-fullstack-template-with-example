package test_test

import (
	"os"
	"testing"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/test"
	"github.com/stretchr/testify/require"
)

// test to make sure an error is returned when the ENV is not set
func TestBeforeError(t *testing.T) {
	currentEnv := os.Getenv("ENV")

	os.Setenv("ENV", "")
	err := test.BeforeEach(t)
	require.Error(t, err) // Check that there is an error

	os.Unsetenv("ENV")
	err = test.BeforeEach(t)
	require.Error(t, err) // Check that there is an error

	os.Setenv("ENV", currentEnv)
}

// test to make sure that when the ENV is set, then the appropriate .env file is loaded
func TestBeforeEach(t *testing.T) {
	currentEnv := os.Getenv("ENV")

	os.Setenv("ENV", "test")
	test.BeforeEach(t)

	os.Setenv("ENV", "continuous_integration")
	test.BeforeEach(t)

	os.Setenv("ENV", currentEnv)
}
