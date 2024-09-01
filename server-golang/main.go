package main

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"gorm.io/gorm"
)

type AppInterface interface {
	Listen(string) error
}

// get all the info for starting the server
func GetServerInitials() (*fiber.App, *gorm.DB, error) {
	godotenv.Load()
	app, db, err := database.Setup()

	// Start server
	port := os.Getenv("PORT")
	fmt.Printf(`🚀 Server running on %s, see http://localhost:%s & for healthCheck see http://localhost:%s/healthCheck`, port, port, port)

	return app, db, err
}

// user an interface for the server, to make testing easier
func StartServer(a AppInterface) {
	a.Listen(fmt.Sprintf(":%s", os.Getenv("PORT")))
}

func main() {
	app, _, _ := GetServerInitials()
	StartServer(app)
}
