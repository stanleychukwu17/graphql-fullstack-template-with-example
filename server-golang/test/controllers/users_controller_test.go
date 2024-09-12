package controllers_test

import (
	"encoding/json"
	"errors"
	"os"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/controllers"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/test"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ###--STARTS-- integration tests
func TestRegisterUser_Integration(t *testing.T) {
	test.BeforeEach(t)
	// t.Skip()

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
	require.Equal(t, "okay", responseBody["msg"])

	// delete the user
	user.Mock_DeleteThisUser(db, t)
}

func TestLoginThisUser(t *testing.T) {
	test.BeforeEach(t)
	// t.Skip()

	// set up new fiber application and the database
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
	if _, err := user.Mock_RegisterUser(app); err != nil {
		t.Fatalf("Failed to send request for registration of user: %v", err)
	}

	// now login the user
	resp, err := user.Mock_LoginUser(app)
	if err != nil {
		t.Fatalf("Failed to send request for Logging into user account: %v", err)
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
func TestRegisterUser_Unit(t *testing.T) {
	test.BeforeEach(t)
	// t.Skip()

	// set up new fiber application and the mock service, also using the mock service in the controller
	app := fiber.New()
	mockService := new(MockUserService)
	controller := &controllers.UsersController{
		UserServices: mockService,
	}

	// register the controller to the app(fiber) with the url and the controller to handle every request to the url
	const reqUrl = "/users/registerUser"
	app.Post(reqUrl, controller.RegisterUser)

	// expects an error when bad json object is sent to the server
	t.Run("it should return fiber.StatusUnprocessableEntity for bad json request object sent to the server", func(t *testing.T) {
		// format the body to json readable string
		body := `{"name": "stanley chukwu",}`
		resp, err := SendRequestToUrl("POST", reqUrl, body, app)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusUnprocessableEntity, resp.StatusCode, "expected status code %d, got %d", fiber.StatusUnprocessableEntity, resp.StatusCode)
	})

	// expects an error when name or username is too short
	t.Run("it should return some fields length are too short (Name, Username)", func(t *testing.T) {
		user := models.User{
			Name: "", Username: "", Email: "st@me.com", Password: "password123", Gender: "male",
		}

		// sends the request
		resp, err := SendRequestToUrl("POST", reqUrl, user.ToJson(), app)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusBadRequest, resp.StatusCode, "Expects an error code if any of the fields are too short")
	})

	// expects an error when email or username already exist
	t.Run("it should return email or username already exist", func(t *testing.T) {
		user := models.User{
			Name: "stanley boy", Username: "stanley", Email: "st@me.com", Password: "password123", Gender: "male",
		}

		// return nil when the mocked function is called
		mockService.On("FindUserByUsernameOrEmail", user.Username, user.Email).Return(&user)

		// sends the request
		resp, err := SendRequestToUrl("POST", reqUrl, user.ToJson(), app)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusUnprocessableEntity, resp.StatusCode, "Expects an error code if email or username already exist")
	})

	// expects an error when trying to create a new user
	t.Run("it should fail to create a new user", func(t *testing.T) {
		timezone := os.Getenv("TIMEZONE")
		curDate, _ := utils.Return_the_current_time_of_this_timezone(timezone)

		user := &models.User{
			Name: "john", Username: "john", Email: "john@me.com", Password: "password", Gender: "male",
			TimeZone: timezone, CreatedAt: curDate.ParsedDate,
		}

		mockService.On("FindUserByUsernameOrEmail", user.Username, user.Email).Return(&models.User{Username: "", Email: ""})
		mockService.On("CreateUser", user).Return(errors.New("failed to create user"))

		// Send the request
		resp, err := SendRequestToUrl("POST", reqUrl, user.ToJson(), app)

		require.NoError(t, err, "Error while sending http request")
		require.Equal(t, fiber.StatusBadRequest, resp.StatusCode, "Expects fiber.StatusBadRequest when trying to create a new user")
	})
}

func TestLoginThisUser_Unit(t *testing.T) {
	test.BeforeEach(t)
	// t.Skip()

	app := fiber.New()
	mockService := new(MockUserService)
	controller := &controllers.UsersController{
		UserServices: mockService,
	}

	const reqUrl = "/users/loginUser"
	app.Post(reqUrl, controller.LoginThisUser)

	// expects an error when bad json request object is sent to the server
	t.Run("it should return fiber.StatusUnprocessableEntity for bad json request object sent to the server", func(t *testing.T) {
		body := `{"username": "stanley",}`

		resp, err := SendRequestToUrl("POST", reqUrl, body, app)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusUnprocessableEntity, resp.StatusCode, "expected status code %d, got %d", fiber.StatusUnprocessableEntity, resp.StatusCode)
	})

	// expects an error when username or password is too short
	t.Run("it should return some fields length are too short (Username, Password)", func(t *testing.T) {
		user := models.User{Username: "stanley", Password: ""}

		// sends the request
		resp, err := SendRequestToUrl("POST", reqUrl, user.ToJson(), app)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusBadRequest, resp.StatusCode, "Expects an error code if any of the fields are too short")
	})

	// expects an error if the username or email address does not exits in our database
	t.Run("it should return user not found", func(t *testing.T) {
		user := models.User{Username: "stanley", Password: "password1234"}

		// return nil when the mocked function is called
		mockService.On("FindUserByUsernameOrEmail", user.Username, user.Username).Return(&models.User{Username: "", Email: ""})

		// sends the request
		resp, err := SendRequestToUrl("POST", reqUrl, user.ToJson(), app)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusNotFound, resp.StatusCode, "Expects a %v status if the username or email address does not exits in our database", fiber.StatusNotFound)
	})

	// expects an error if password is a wrong password
	t.Run("it should return wrong password", func(t *testing.T) {
		user := models.User{Username: "pascal", Password: "password1234"}

		mockService.On("FindUserByUsernameOrEmail", user.Username, user.Username).Return(&models.User{Username: user.Username, Password: user.Password, Email: user.Email})
		mockService.On("VerifyPassword", user.Password, user.Password).Return(false)

		// sends the request
		resp, err := SendRequestToUrl("POST", reqUrl, user.ToJson(), app)

		require.NoError(t, err)
		require.Equal(t, fiber.StatusUnauthorized, resp.StatusCode, "Expects a %v status if password is a wrong password", fiber.StatusUnauthorized)
	})
}

// ###--ENDS--
