package middleware_test

import (
	"fmt"
	"io"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/test"
	"github.com/stretchr/testify/require"
)

func TestDeserializerUser_WithInvalidSessionFid(t *testing.T) {
	test.BeforeEach(t)

	// set up new fiber application and return a UserModel instance
	app, db, user, _ := test.CreateFiberApp_DB_UserAccount(t)
	defer user.Mock_DeleteThisUser(db, t) // after the test is completed

	// log user in
	loginRespBody := test.MockTestRegisterAndLoginUser(t, user, db, app)
	require.NotNil(t, loginRespBody)

	accessToken := loginRespBody["accessToken"].(string)
	refreshToken := loginRespBody["refreshToken"].(string)
	// session_fid := loginRespBody["session_fid"].(string)

	t.Run("should return token is invalid when it receives the wrong sessionFid", func(t *testing.T) {
		body := fmt.Sprintf(
			`{"session_fid": "%s", "accessToken": "%s", "refreshToken": "%s"}`,
			"123456789", accessToken, refreshToken,
		)

		resp, err := test.SendRequestToUrl("POST", test.HealthTokenUrl, body, app)
		require.NoError(t, err)
		require.Equal(t, resp.StatusCode, fiber.StatusUnauthorized)
	})
}

func TestDeserializerUser_WithExpiredToken(t *testing.T) {
	test.BeforeEach(t)

	// sets the time for the accessToken to 0.5seconds, so the the accessToken will expire very fast
	os.Setenv("JWT_TIME_1", "0.0000058")

	// set up new fiber application, database connection and a new UserModel instance
	app, db, user, _ := test.CreateFiberApp_DB_UserAccount(t)
	defer user.Mock_DeleteThisUser(db, t) // after the test is completed

	// log user in
	loginRespBody := test.MockTestRegisterAndLoginUser(t, user, db, app)
	require.NotNil(t, loginRespBody)

	// Sleep for 3 seconds to ensure the token has expired
	time.Sleep(1 * time.Second)

	accessToken := loginRespBody["accessToken"].(string)
	refreshToken := loginRespBody["refreshToken"].(string)
	session_fid := loginRespBody["session_fid"].(string)

	t.Run("should return token is invalid when it receives the wrong sessionFid", func(t *testing.T) {
		body := fmt.Sprintf(
			`{"session_fid": "%s", "accessToken": "%s", "refreshToken": "%s"}`,
			"123456789", accessToken, refreshToken,
		)

		// send the request
		resp, err := test.SendRequestToUrl("POST", test.HealthTokenUrl, body, app)
		require.NoError(t, err)
		require.Equal(t, resp.StatusCode, fiber.StatusUnauthorized)
	})

	t.Run("should create a new accessToken when the current accessToken has expired", func(t *testing.T) {
		// format the request body
		body := fmt.Sprintf(
			`{"session_fid": "%s", "accessToken": "%s", "refreshToken": "%s"}`,
			session_fid, accessToken, refreshToken,
		)

		// send the request
		resp, err := test.SendRequestToUrl("POST", test.HealthTokenUrl, body, app)
		responseBody, _ := io.ReadAll(resp.Body)
		responseBodyStr := string(responseBody)

		require.NoError(t, err)
		require.Equal(t, resp.StatusCode, fiber.StatusOK)
		require.Contains(t, responseBodyStr, "newAccessToken")
		require.Contains(t, responseBodyStr, "new_token")
	})
}
