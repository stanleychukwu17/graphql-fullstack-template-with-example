package controllers_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/services"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

const registerUrl = "/users/registerUser"
const loginUrl = "/users/loginUser"

// SendRequestToUrl sends a request to a url on the fiber app.
func SendRequestToUrl(method string, url string, body string, app *fiber.App) (*http.Response, error) {
	req := httptest.NewRequest(method, url, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	return resp, err
}

type rgUserType struct {
	models.User
}

// Mock_RegisterUser sends a POST request to the "/users/registerUser" endpoint of the Fiber app with the user object converted to JSON.
func (u *rgUserType) Mock_RegisterUser(app *fiber.App) (*http.Response, error) {
	return SendRequestToUrl("POST", registerUrl, u.ToJson(), app)
}

// Mock_LoginUser sends a POST request to the "/users/loginUser" endpoint of the Fiber app with the user object converted to JSON.
func (u *rgUserType) Mock_LoginUser(app *fiber.App) (*http.Response, error) {
	return SendRequestToUrl("POST", loginUrl, u.ToJson(), app)
}

// Mock_DeleteThisUser deletes the user with the given username from the database.
func (u *rgUserType) Mock_DeleteThisUser(db *gorm.DB, t *testing.T) {
	user := models.User{}
	err := db.Where("username = ?", u.Username).First(&user).Error
	if err != nil {
		if err.Error() != "record not found" {
			t.Fatalf("Error occurred when searching for the user to delete, check your sql syntax, Error msg: %v", err)
		}
	}

	db.Exec("DELETE FROM users WHERE id = ? limit 1", user.ID)
	db.Exec("DELETE FROM users_session WHERE user_id = ? limit 1", user.ID)
}

// ###
// ###--STARTS-- MockUserService tests
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

//###--ENDS--
