package test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/services"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

const (
	RegisterUrl    = "/users/registerUser"
	LoginUrl       = "/users/loginUser"
	LogOutUrl      = "/users/logout"
	HealthTokenUrl = "/healthCheck/accessToken"
)

//
// 	START: Helper functions
//

func CreateFiberApp_DB_UserAccount(t *testing.T) (*fiber.App, *gorm.DB, *UserStruct, error) {
	// set up new fiber application
	app, db, err := database.Setup()

	now := time.Now()
	milliseconds := now.UnixNano() / 1_000_000
	millisecondsStr := fmt.Sprintf("%d", milliseconds)

	username := fmt.Sprintf("john_%s", millisecondsStr)
	email := fmt.Sprintf("john_%s_email@example.com", millisecondsStr)

	// Create a test user
	user := &UserStruct{
		User: models.User{
			Name: "John Doe", Username: username, Email: email, Password: "password", Gender: "male",
		},
	}

	return app, db, user, err
}

// SendRequestToUrl [helperFunction] sends a request to a url on the fiber app.
func SendRequestToUrl(method string, url string, body string, app *fiber.App) (*http.Response, error) {
	req := httptest.NewRequest(method, url, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	return resp, err
}

func MockTestRegisterAndLoginUser(t *testing.T, user *UserStruct, db *gorm.DB, app *fiber.App) map[string]interface{} {
	// Register the user
	_, err := user.Mock_RegisterUser(app)
	if err != nil {
		t.Fatalf("Failed to send request for registration of user: %v", err)
	}

	// now login the user
	resp, err := user.Mock_LoginUser(app)
	if err != nil {
		t.Fatalf("Failed to send request for Logging into user account: %v", err)
	}

	// check login response status
	require.Equal(t, fiber.StatusOK, resp.StatusCode)

	// decode login response body, so we can collect the session_fid
	var loginRespBody map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&loginRespBody)
	if err != nil {
		t.Fatalf("Failed to decode response body: %v", err)
	}

	// assert response body["msg"] is okay
	require.Equal(t, "okay", loginRespBody["msg"])
	require.NotNil(t, loginRespBody["accessToken"])
	require.NotNil(t, loginRespBody["refreshToken"])

	return loginRespBody
}

//
// END: Helper functions
//

// UserStruct is a struct that contains a user object.
// It implements the MockRegisterUser and MockLoginUser methods.
type UserStruct struct {
	models.User
}

// Mock_RegisterUser sends a POST request to the "/users/registerUser" endpoint of the Fiber app with the user object converted to JSON.
func (u *UserStruct) Mock_RegisterUser(app *fiber.App) (*http.Response, error) {
	return SendRequestToUrl("POST", RegisterUrl, u.ToJson(), app)
}

// Mock_LoginUser sends a POST request to the "/users/loginUser" endpoint of the Fiber app with the user object converted to JSON.
func (u *UserStruct) Mock_LoginUser(app *fiber.App) (*http.Response, error) {
	return SendRequestToUrl("POST", LoginUrl, u.ToJson(), app)
}

func (u *UserStruct) Mock_LogoutUser(app *fiber.App, dts map[string]interface{}) (*http.Response, error) {
	session_fid := dts["session_fid"].(string)
	accessToken := dts["accessToken"].(string)
	refreshToken := dts["refreshToken"].(string)

	toSend := fmt.Sprintf(`
		{"accessToken": "%s", "refreshToken": "%s", "session_fid": "%s"}`,
		accessToken, refreshToken, session_fid,
	)
	return SendRequestToUrl("POST", LogOutUrl, toSend, app)
}

// Mock_DeleteThisUser deletes the user with the given username from the database.
func (u *UserStruct) Mock_DeleteThisUser(db *gorm.DB, t *testing.T) {
	user := models.User{}
	err := db.Raw("SELECT id FROM users WHERE username = ? limit 1", u.Username).Scan(&user).Error
	if err == nil {
		db.Exec("DELETE FROM users WHERE id = ? limit 1", user.ID)
		db.Exec("DELETE FROM users_session WHERE user_id = ? limit 1", user.ID)
	}
}

// STARTS: MockUserService
type MockUserService struct {
	mock.Mock
}

func (m *MockUserService) CreateUser(user *models.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserService) FindUserByUsernameOrEmail(username, email string) *models.User {
	args := m.Called(username, email)
	return args.Get(0).(*models.User)
}

func (m *MockUserService) HashPassword(password string) (string, error) {
	return "", nil
}

func (m *MockUserService) VerifyPassword(hashedPassword, password string) bool {
	args := m.Called(hashedPassword, password)
	return args.Get(0).(bool)
}

func (m *MockUserService) CreateSession(userId int) services.CheckSession {
	return services.CheckSession{}
}

// ENDS: MockUserService
