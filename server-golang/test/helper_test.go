package test_test

import (
	"os"
	"testing"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/test"
	"github.com/stretchr/testify/require"
)

// test to make sure an error is returned when the ENV is not set
func TestBeforeEach_Error(t *testing.T) {
	currentEnv := os.Getenv("ENV")
	currentBG_USER := os.Getenv("BG_USER")

	// Error when ENV is not set
	os.Setenv("ENV", "")
	err := test.BeforeEach(t)
	require.Error(t, err)

	// Error when ENV is not set
	os.Unsetenv("ENV")
	err = test.BeforeEach(t)
	require.Error(t, err)

	// Error when ENV  of $PORT & $DB_NAME is not set
	os.Setenv("ENV", "continuous_integration")
	os.Setenv("BG_USER", "pass_test")
	err = test.BeforeEach(t)
	require.Error(t, err)

	// done with the testing, take things back to the way we met them
	os.Setenv("ENV", currentEnv)
	os.Setenv("BG_USER", currentBG_USER)
}

// test to make sure that when the ENV is set, then the appropriate .env file is loaded
func TestBeforeEach(t *testing.T) {
	currentEnv := os.Getenv("ENV")

	os.Setenv("ENV", "development")
	test.BeforeEach(t)

	os.Setenv("ENV", "continuous_integration")
	test.BeforeEach(t)

	os.Setenv("ENV", currentEnv)
}
