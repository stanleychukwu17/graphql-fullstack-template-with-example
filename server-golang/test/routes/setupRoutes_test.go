package routes_test

import (
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stretchr/testify/require"
)

func beforeEach() {
	os.Setenv("ENV", "test")
	godotenv.Load("../../.env.test")
}

func TestSetUpRoutes(t *testing.T) {
	beforeEach()

	// set up new fiber application
	app, _, err := database.Setup()
	if err != nil {
		t.Fatalf("Could not set up the database and a new Fiber App: %v", err)
	}

	// Sends the request
	req := httptest.NewRequest("GET", "/healthCheck", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)

	require.Equal(t, fiber.StatusOK, resp.StatusCode)
	require.NoError(t, err, "Expected no error while sending the request")
}
