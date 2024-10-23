package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/controllers"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/services"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
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
	// api := app.Group("/users")
	// api.Post("/registerUser", uControl.RegisterUser)

	urlMap := utils.GetUrlMap()

	// initialize the users controller
	userServices := &services.UserServiceStruct{DB: u.DB}
	uControl := &controllers.UsersController{DB: u.DB, UserServices: userServices}

	api := app
	api.Post(urlMap.Users.Register, uControl.RegisterUser)                  // invokes RegisterUser method.
	api.Post(urlMap.Users.Login, uControl.LoginThisUser)                    // invokes LoginThisUser method.
	api.Post(urlMap.Users.Logout, uControl.LogOutThisUser)                  // invokes LogOutThisUser method.
	api.Post(urlMap.Users.CleanTestDB, uControl.CleanUpTestingFromDatabase) // invokes LogOutThisUser method.
}
