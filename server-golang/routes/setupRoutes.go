package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// create a function to set up routes
func SetUpRoutes(app *fiber.App, db *gorm.DB) {
	usersRoutes := &UsersRoutes{DB: db}
	usersRoutes.SetUpRoutes(app)
}
