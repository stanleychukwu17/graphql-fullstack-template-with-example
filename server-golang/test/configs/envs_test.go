package configs_test

import (
	"fmt"
	"os"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/configs"
	"github.com/stretchr/testify/require"
)

// Define a mock EnvLoader that returns an error.
type mockEnvLoaderWithError struct{}

func (m *mockEnvLoaderWithError) Load() error {
	return fmt.Errorf("Error loading .env file")
}

// Define a mock EnvLoader that returns the environment variables.
type mockEnvLoaderWithEnvs struct{}

func (m *mockEnvLoaderWithEnvs) Load() error {
	return godotenv.Load("../../.env.test")
}

func beforeEach() {
	os.Setenv("ENV", "test")
}

func TestInitConfig_Error(t *testing.T) {
	beforeEach()

	// Call initConfig function with the mock loader.
	_, err := configs.InitConfig(&mockEnvLoaderWithError{})

	// Use require.Error to assert that an error is returned.
	require.Error(t, err)

	// checks the exact error message.
	require.Equal(t, "Error loading .env file", err.Error())
}

func TestInitConfig_Success(t *testing.T) {
	beforeEach()

	// call initConfig function
	config, err := configs.InitConfig(&mockEnvLoaderWithEnvs{})

	require.NoError(t, err)
	require.NotNil(t, config)
	require.Equal(t, "test", config.ENV)
	require.Equal(t, "4000", config.PORT)
	require.Equal(t, 7, config.JWT_TIME_1)
}

func TestGetEnv_Fallback(t *testing.T) {
	expected := "fallback"
	result := configs.GetEnv("nothing-in-the-var", expected)

	require.Equal(t, expected, result)
}

func TestGetEnvAsInt_Fallback(t *testing.T) {
	expected := 100
	result := configs.GetEnvAsInt("nothing-in-the-var", expected)

	require.Equal(t, expected, result)
}
