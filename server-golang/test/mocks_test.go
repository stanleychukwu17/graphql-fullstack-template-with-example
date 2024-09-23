package test_test

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/services"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/test"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func TestCreateFiberApp_DB_UserAccount(t *testing.T) {
	test.BeforeEach(t)
	app, db, user, err := test.CreateFiberApp_DB_UserAccount(t)

	require.IsType(t, &fiber.App{}, app, "app should be of type *fiber.App")
	require.IsType(t, &gorm.DB{}, db, "db should be of type *gorm.DB")
	require.IsType(t, &test.UserStruct{}, user, "user should be of type *model.User")
	require.NoError(t, err)

	t.Run("it should create a new user account and login the user", func(t *testing.T) {
		loginRespBody := test.MockTestRegisterAndLoginUser(t, user, db, app)
		defer user.Mock_DeleteThisUser(db, t) // after the test is completed

		require.Equal(t, "okay", loginRespBody["msg"])
	})
}

func TestSendRequestToUrl(t *testing.T) {
	app := fiber.New()

	resp, err := test.SendRequestToUrl("GET", "http://localhost:7000/nosite", "", app)
	require.NoError(t, err)
	require.Equal(t, fiber.StatusNotFound, resp.StatusCode)
}

func TestUserStruct(t *testing.T) {
	app := fiber.New()
	userStruct := test.UserStruct{}

	logOutDts := map[string]interface{}{
		"session_fid":  "session_fid",
		"accessToken":  "accessToken",
		"refreshToken": "refreshToken",
	}

	_, registerErr := userStruct.Mock_RegisterUser(app)
	_, loginErr := userStruct.Mock_LoginUser(app)
	_, loginOutErr := userStruct.Mock_LogoutUser(app, logOutDts)

	require.NoError(t, registerErr)
	require.NoError(t, loginErr)
	require.NoError(t, loginOutErr)
}

// lets use the AAA(Arrange, Act & Assert) method to test the MockUserService struct
func TestMockUserServiceStruct(t *testing.T) {
	// Arrange
	mockUserService := new(test.MockUserService)
	mockUser := &models.User{
		Username: "user",
		Email:    "testuser@example.com",
	}

	t.Run("CreateUser Mock Test", func(t *testing.T) {
		// Mock the behavior of CreateUser to return nil (indicating success)
		mockUserService.On("CreateUser", mockUser).Return(nil)

		// Act
		err := mockUserService.CreateUser(mockUser)

		// Assert
		require.NoError(t, err)
	})

	t.Run("FindUserByUsernameOrEmail Mock Test", func(t *testing.T) {
		// Mock the behavior of FindUserByUsernameOrEmail to return mockUser
		mockUserService.On("FindUserByUsernameOrEmail", mockUser.Username, mockUser.Email).Return(mockUser)

		// Act
		user := mockUserService.FindUserByUsernameOrEmail(mockUser.Username, mockUser.Email)

		// Assert
		require.Equal(t, mockUser, user)
	})

	t.Run("HashPassword Mock Test", func(t *testing.T) {
		// Mock the behavior of HashPassword to return ""
		mockUserService.On("HashPassword", mockUser.Password).Return("", nil)

		// Act
		hashedPassword, err := mockUserService.HashPassword(mockUser.Password)

		// Assert
		require.NoError(t, err)
		require.Equal(t, "", hashedPassword)
	})

	t.Run("VerifyPassword Mock Test", func(t *testing.T) {
		// Mock the behavior of VerifyPassword to return false
		mockUserService.On("VerifyPassword", mockUser.Password, mockUser.Password).Return(false)

		// Act
		isValid := mockUserService.VerifyPassword(mockUser.Password, mockUser.Password)

		// Assert
		require.False(t, isValid)
	})

	t.Run("CreateSession Mock Test", func(t *testing.T) {
		// Mock the behavior of CreateSession to return CheckSession{}
		mockUserService.On("CreateSession", mockUser.ID).Return(services.CheckSession{})

		// Act
		session := mockUserService.CreateSession(mockUser.ID)

		// Assert
		require.IsType(t, services.CheckSession{}, session)
	})
}
