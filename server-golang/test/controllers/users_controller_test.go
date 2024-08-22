package controllers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func beforeEach() {
	os.Setenv("ENV", "test")
	godotenv.Load("../../.env.test")
}

type rgUserType struct {
	models.User
}

func (u *rgUserType) Mock_RegisterUser(app *fiber.App) (*http.Response, error) {
	// Create a test user
	userData := fmt.Sprintf(
		`{"name":"%s","username":"%s","email":"%s","password":"%s","gender":"%s"}`, u.Name, u.Username, u.Email, u.Password, u.Gender,
	)

	// Sends the request
	req := httptest.NewRequest("POST", "/users/registerUser", bytes.NewBufferString(userData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	return resp, err
}

func (u *rgUserType) Mock_LoginUser(app *fiber.App) (*http.Response, error) {
	// Create a test user
	userData := fmt.Sprintf(
		`{"username":"%s","password":"%s"}`, u.Username, u.Password,
	)

	// Sends the request
	req := httptest.NewRequest("POST", "/users/loginUser", bytes.NewBufferString(userData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	return resp, err
}

func (u *rgUserType) Mock_DeleteThisUser(db *gorm.DB, t *testing.T) {
	result := db.Exec("DELETE FROM users WHERE username = ?", u.Username)
	fmt.Printf("DELETE FROM users WHERE username = %v \n", u.Username)

	if result.Error != nil {
		t.Fatalf("Failed to delete test user: %v", result.Error)
	}
}

func TestRegisterUser(t *testing.T) {
	// set up before each test
	beforeEach()

	// set up new fiber application
	app, db, err := database.Setup()
	if err != nil {
		t.Fatalf("Could not set up the database and a new Fiber App: %v", err)
	}

	// Create a test user
	user := rgUserType{
		User: models.User{
			Name: "John Doe", Username: "johndoe", Email: "john@example.com", Password: "password", Gender: "male",
		},
	}

	// Sends the request
	resp, err := user.Mock_RegisterUser(app)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	// check response status
	assert.Equal(t, fiber.StatusCreated, resp.StatusCode)

	// check response body
	var responseBody map[string]interface{}
	if err = json.NewDecoder(resp.Body).Decode(&responseBody); err != nil {
		t.Fatalf("Failed to decode response body: %v", err)
	}

	// assert response body["msg"] is okay
	assert.Equal(t, "okay", responseBody["msg"])
	fmt.Printf("responseBody: %+v\n", responseBody)

	// delete the user
	user.Mock_DeleteThisUser(db, t)
}

func TestLoginThisUser(t *testing.T) {
	// set up before each test
	beforeEach()

	// set up new fiber application
	app, db, err := database.Setup()
	if err != nil {
		t.Fatalf("Could not set up the database and a new Fiber App: %v", err)
	}

	// Create a test user
	user := rgUserType{
		User: models.User{
			Name: "John Doe", Username: "johndoe", Email: "john@example.com", Password: "password", Gender: "male",
		},
	}
	// delete user incase it already exist
	user.Mock_DeleteThisUser(db, t)

	// Register the user
	_, err = user.Mock_RegisterUser(app)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	// now login the user
	resp, err := user.Mock_LoginUser(app)
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	// check response status
	assert.Equal(t, fiber.StatusOK, resp.StatusCode)

	// check response body
	var responseBody map[string]interface{}
	if err = json.NewDecoder(resp.Body).Decode(&responseBody); err != nil {
		t.Fatalf("Failed to decode response body: %v", err)
	}

	// assert response body["msg"] is okay
	assert.Equal(t, "okay", responseBody["Msg"])
	assert.NotNil(t, responseBody["Name"])
	assert.NotNil(t, responseBody["RefreshToken"])

	// delete the user
	user.Mock_DeleteThisUser(db, t)
}
