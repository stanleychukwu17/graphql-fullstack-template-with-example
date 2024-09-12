package routes_test

import (
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/test"
	"github.com/stretchr/testify/require"
)

func TestSetUpRoutes(t *testing.T) {
	test.BeforeEach(t)

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
