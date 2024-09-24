package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/controllers"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/services"
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
	userServices := &services.UserServiceStruct{DB: u.DB}
	uControl := &controllers.UsersController{DB: u.DB, UserServices: userServices}

	api.Post("/registerUser", uControl.RegisterUser) // Handles POST requests to "/users/registerUser" by invoking the RegisterUser method.
	api.Post("/loginUser", uControl.LoginThisUser)   // Handles POST requests to "/users/loginUser" by invoking the LoginThisUser method.
	api.Post("/logout", uControl.LogOutThisUser)     // Handles POST requests to "/users/logout" by invoking the LogOutThisUser method.
}
