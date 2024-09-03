package controllers_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/controllers"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/services"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
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
	result := db.Exec("DELETE FROM users WHERE username = ? limit 1", u.Username)
	fmt.Printf("DELETE FROM users WHERE username = %v \n", u.Username)

	if result.Error != nil {
		t.Fatalf("Failed to delete test user: %v", result.Error)
	}
}

// ###--STARTS-- integration tests
func TestRegisterUser_Integration(t *testing.T) {
	beforeEach()
	t.Skip()

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

	// delete the user
	user.Mock_DeleteThisUser(db, t)
}

func TestLoginThisUser(t *testing.T) {
	beforeEach()
	t.Skip()

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

//###--ENDS--

// ###--STARTS-- unit tests
type MockUserService struct {
	mock.Mock
}

func (m *MockUserService) CreateUser(user *models.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserService) FindUserByUsernameOrEmail(username, email string) *models.User {
	args := m.Called(username, email)
	// return args.Get(0).(*models.User), args.Error(1)
	return args.Get(0).(*models.User)
}

func (m *MockUserService) HashPassword(password string) (string, error) {
	return "", nil
}

func (m *MockUserService) VerifyPassword(hashedPassword, password string) bool {
	return true
}

func (m *MockUserService) CreateSession(userId int) services.CheckSession {
	return services.CheckSession{}
}

func TestRegisterUser_Unit(t *testing.T) {
	beforeEach()

	app := fiber.New()
	mockService := new(MockUserService)
	controller := &controllers.UsersController{
		UserServices: mockService,
	}

	const reqUrl = "/users/registerUser"
	app.Post(reqUrl, controller.RegisterUser)

	// expects an error when bad json object is received
	t.Run("Bad json object sent", func(t *testing.T) {
		const name = "stanley chukwu"

		// format the body to json readable string
		body := fmt.Sprintf(`{"name": "%s",}`, name)

		req := httptest.NewRequest("POST", reqUrl, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusUnprocessableEntity, resp.StatusCode, "expected status code %d, got %d", fiber.StatusUnprocessableEntity, resp.StatusCode)
	})

	// expects an error when name or username is too short
	t.Run("Some fields length are too short (Name, Username)", func(t *testing.T) {
		const name, username, email, password, gender = "", "", "st@me.com", "password123", "male"
		user := models.User{
			Name:     name,
			Username: username,
			Email:    email,
			Password: password,
			Gender:   gender,
		}

		req := httptest.NewRequest("POST", reqUrl, strings.NewReader(user.ToJson()))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusBadRequest, resp.StatusCode, "Expects an error code if email or username already exist")
	})

	// expects an error when email or username already exist
	t.Run("Email or username already exist", func(t *testing.T) {
		const name, username, email, password, gender = "stanley chukwu", "stanley", "stanley@me.com", "password123", "male"
		user := models.User{
			Name:     name,
			Username: username,
			Email:    email,
			Password: password,
			Gender:   gender,
		}

		// return nil when the mocked function is called
		mockService.On("FindUserByUsernameOrEmail", user.Username, user.Email).Return(&user)

		req := httptest.NewRequest("POST", reqUrl, strings.NewReader(user.ToJson()))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusUnprocessableEntity, resp.StatusCode, "Expects an error code if email or username already exist")
	})

	// expects an error when trying to create a new user
	t.Run("Failing to create a new user", func(t *testing.T) {
		const name, username, email, password, gender = "john", "john", "john@me.com", "password123", "male"
		user := models.User{
			Name:     name,
			Username: username,
			Email:    email,
			Password: password,
			Gender:   gender,
			TimeZone: os.Getenv("TIMEZONE"),
		}

		mockService.On("FindUserByUsernameOrEmail", user.Username, user.Email).Return(&models.User{Username: "", Email: ""})
		mockService.On("CreateUser", &user).Return(errors.New("failed to create user"))

		// format the body to json readable string
		body := fmt.Sprintf(`{
			"name": "%s", "username": "%s", "email": "%s", "password": "%s", "gender": "%s", "timezone": "%s"
		}`, name, username, email, password, gender, os.Getenv("TIMEZONE"))

		// Send the request
		req := httptest.NewRequest("POST", reqUrl, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		require.NoError(t, err, "Error while sending http request")
		require.Equal(t, fiber.StatusBadRequest, resp.StatusCode, "Expects fiber.StatusBadRequest when trying to create a new user")
	})

}

// ###--ENDS--
