package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
	"gorm.io/gorm"
)

// create a function to set up routes
func SetUpRoutes(app *fiber.App, db *gorm.DB) {
	// Route to check if connection is working
	app.Get("/healthCheck", func(ctx *fiber.Ctx) error {
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"msg": "okay-1", "cause": "Users route says:Hello, World!"})
	})

	// Route to check if connection is working
	app.Post("/healthCheck/accessToken", func(ctx *fiber.Ctx) error {
		loggedInDts := ctx.Locals("loggedInDts")
		if loggedInDts == nil {
			return ctx.Status(fiber.StatusUnauthorized).JSON(utils.Show_bad_message("Invalid accessToken"))
		}

		loggedIn := loggedInDts.(map[string]interface{})["loggedIn"]
		new_token := loggedInDts.(map[string]interface{})["new_token"]
		newAccessToken := loggedInDts.(map[string]interface{})["newAccessToken"]
		// fmt.Printf("loggedInDts: %v\n", loggedInDts)

		if loggedIn.(bool) {
			if new_token == "yes" {
				return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
					"msg":       "okay",
					"new_token": new_token,
					"dts": map[string]interface{}{
						"newAccessToken": newAccessToken,
					},
				})
			} else {
				return ctx.Status(fiber.StatusOK).JSON(utils.Show_good_message("user is logged in"))
			}
		} else {
			return ctx.Status(fiber.StatusBadRequest).JSON(utils.Show_bad_message("Invalid accessToken"))
		}
	})

	usersRoutes := &UsersRoutes{DB: db}
	usersRoutes.SetUpRoutes(app)
}
