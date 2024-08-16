package routes

import (
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"gorm.io/gorm"
)

type UsersRoutes struct {
	DB *gorm.DB
}

func (u *UsersRoutes) SetUpRoutes(app *fiber.App) {
	api := app.Group("/users")

	api.Get("/", u.GetAllUsers)
}

func (u *UsersRoutes) GetAllUsers(ctx *fiber.Ctx) error {
	ctx.Status(fiber.StatusOK).JSON(fiber.Map{"msg": "okay", "cause": "Hello, World!"})
	return nil
}

// route to register a new user
func (u *UsersRoutes) RegisterNewUser(ctx *fiber.Ctx) error {
	user := models.User{}

	// Parse the request body & bind it to the book struct
	// the context.BodyParser(&book), is parsing the request body from json to go struct.. Fiber does this internally, be default, Golang does not understand json
	if err := ctx.BodyParser(&user); err != nil {
		// Log the error and respond with a 400 Bad Request
		log.Println("Error parsing request body:", err)

		return ctx.Status(http.StatusUnprocessableEntity).JSON(
			map[string]interface{}{
				"message": "Invalid request body",
			},
		)
	}

	return nil
}
