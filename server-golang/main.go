package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/configs"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"gorm.io/gorm"
)

type AppInterface interface {
	Listen(string) error
}

// get all the info for starting the server
func GetServerInitials() (*fiber.App, *gorm.DB, error) {
	app, db, err := database.Setup()

	// Start server
	port := configs.Envs.PORT
	fmt.Printf(`🚀 Server running on %s, see http://localhost:%s & for healthCheck see http://localhost:%s/healthCheck`, port, port, port)

	return app, db, err
}

// user an interface for the server, to make testing easier
func StartServer(a AppInterface) {
	a.Listen(fmt.Sprintf(":%s", configs.Envs.PORT))
}

func main() {
	app, _, _ := GetServerInitials()
	StartServer(app)
}
