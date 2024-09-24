package middleware

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
	"gorm.io/gorm"
)

// DeserializeStruct
type DeserializeStruct struct {
	DB *gorm.DB
}

// DeserializeUser middleware
func (d *DeserializeStruct) DeserializeUser(ctx *fiber.Ctx) error {
	sessionDts := models.UsersSession{}

	query := struct {
		AccessToken  string `json:"accessToken"`
		RefreshToken string `json:"refreshToken"`
		SessionFid   string `json:"session_fid"`
	}{}

	// parse the request body
	ctx.BodyParser(&query)

	// if there is no accessToken, you can move on
	if len(query.AccessToken) == 0 {
		return ctx.Next()
	}

	// verify the accessToken
	payload, err := utils.VerifyJwt(query.AccessToken)

	// it means the accessToken is still valid
	if err == nil {
		payloadSessionFid := fmt.Sprintf("%v", payload.Data.SessionFid)

		// the decoded jwt payloadSessionFid must match the query sessionFid received from the client
		if payloadSessionFid != query.SessionFid {
			return ctx.Next()
		}

		// fetch the session details and check for any query errors
		d.DB.Raw(
			"SELECT user_id FROM users_session WHERE fake_id = ? and active = 'yes' and created_at = ? limit 1",
			payloadSessionFid,
			payload.Data.CreatedAt,
		).Scan(&sessionDts)

		// if we found a user, it means the session is still active and all is well
		if sessionDts.UserId > 0 {
			ctx.Locals("loggedInDts", map[string]interface{}{
				"loggedIn":   true,
				"userId":     sessionDts.UserId,
				"sessionFid": payloadSessionFid,
			})
			return ctx.Next()
		}
	}

	// verify the refreshToken
	payload, err = utils.VerifyJwt(query.RefreshToken)

	// it means the refreshToken is still valid, so we have to generate a new accessToken
	if err == nil {
		payloadSessionFid := fmt.Sprintf("%v", payload.Data.SessionFid)

		// the decoded jwt payloadSessionFid must match the query sessionFid received from the client
		if payloadSessionFid != query.SessionFid {
			return ctx.Next()
		}

		// fetch the session details and check for any query errors
		d.DB.Raw(
			"SELECT user_id FROM users_session WHERE fake_id = ? and active = 'yes' and created_at = ? limit 1",
			payloadSessionFid,
			payload.Data.CreatedAt,
		).Scan(&sessionDts)

		// if we found a user, it means the session is still active
		// so we have to generate a new accessToken
		if sessionDts.UserId > 0 {
			// payload used to create accessToken and refreshTokens
			newPayload := map[string]interface{}{
				"session_fid": payloadSessionFid,
				"created_at":  payload.Data.CreatedAt,
			}

			newAccessToken, _ := utils.SignJWT(newPayload, os.Getenv("JWT_TIME_1"))
			ctx.Locals("loggedInDts", map[string]interface{}{
				"loggedIn":       true,
				"userId":         sessionDts.UserId,
				"sessionFid":     payloadSessionFid,
				"new_token":      "yes",
				"newAccessToken": newAccessToken,
			})

			return ctx.Next()
		}
	}

	return ctx.Next()
}
