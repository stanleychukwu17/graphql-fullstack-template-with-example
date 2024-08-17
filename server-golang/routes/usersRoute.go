package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/controllers"
	"gorm.io/gorm"
)

// UsersRoutes represents the routes related to user operations in the application.
// It holds a reference to the database connection used for user-related queries.
type UsersRoutes struct {
	// DB is a pointer to a Gorm DB instance used for interacting with the database.
	DB *gorm.DB
}

// SetUpRoutes configures the routes related to user operations for the given Fiber application.
// It sets up the routes under the "/users" path and binds them to the appropriate handler methods.
func (u *UsersRoutes) SetUpRoutes(app *fiber.App) {
	// Create a new route group for "/users".
	api := app.Group("/users")

	// initialize the users controller
	uControl := &controllers.UsersController{DB: u.DB}

	api.Get("/", u.GetAllUsers)                      // Handles GET requests to "/users" by invoking the GetAllUsers method.
	api.Post("/registerUser", uControl.RegisterUser) // Handles POST requests to "/users/registerNewUser" by invoking the RegisterUser method.
}

// GetAllUsers gets all the registered users
func (u *UsersRoutes) GetAllUsers(ctx *fiber.Ctx) error {
	ctx.Status(fiber.StatusOK).JSON(fiber.Map{"msg": "okay", "cause": "Users route says:Hello, World!"})
	return nil
}
