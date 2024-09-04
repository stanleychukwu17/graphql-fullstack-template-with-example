package controllers_test

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/services"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

const registerUrl = "/users/registerUser"
const loginUrl = "/users/loginUser"

func sendRequestToUrl(method string, url string, body string, app *fiber.App) (*http.Response, error) {
	req := httptest.NewRequest(method, url, bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	return resp, err
}

type rgUserType struct {
	models.User
}

func (u *rgUserType) Mock_RegisterUser(app *fiber.App) (*http.Response, error) {
	// Create a test user
	userData := fmt.Sprintf(
		`{"name":"%s","username":"%s","email":"%s","password":"%s","gender":"%s"}`, u.Name, u.Username, u.Email, u.Password, u.Gender,
	)

	return sendRequestToUrl("POST", registerUrl, userData, app)
}

func (u *rgUserType) Mock_LoginUser(app *fiber.App) (*http.Response, error) {
	// Create a test user
	userData := fmt.Sprintf(`{"username":"%s","password":"%s"}`, u.Username, u.Password)

	return sendRequestToUrl("POST", loginUrl, userData, app)
}

func (u *rgUserType) Mock_DeleteThisUser(db *gorm.DB, t *testing.T) {
	db.Exec("DELETE FROM users WHERE username = ? limit 1", u.Username)
}

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
	return false
}

func (m *MockUserService) CreateSession(userId int) services.CheckSession {
	return services.CheckSession{}
}
