package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// create a function to set up routes
func SetUpRoutes(app *fiber.App, db *gorm.DB) {
	// Route to check if connection is working
	app.Get("/healthCheck", func(ctx *fiber.Ctx) error {
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{"msg": "okay", "cause": "Users route says:Hello, World!"})
	})

	usersRoutes := &UsersRoutes{DB: db}
	usersRoutes.SetUpRoutes(app)
}
