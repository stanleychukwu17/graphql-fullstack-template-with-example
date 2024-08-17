package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/routes"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// port should come from .env
	port, exists := os.LookupEnv("PORT")
	if !exists {
		log.Fatalf("PORT environment variable is required but not set")
	}

	// Connect to database
	db, err := database.NewConnection()
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	} else {
		fmt.Println("Connected to database", db)
	}

	// Automatically migrate your schema :: err = db.AutoMigrate(&models.User{}, &models.Book{})
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Create new Fiber instance
	app := fiber.New()

	// Create GET route on path "/"
	app.Get("/healthCheck", func(context *fiber.Ctx) error {
		return context.SendString("Hello, World!")
	})

	// setUp routes
	routes.SetUpRoutes(app, db)

	// Print message to console
	fmt.Printf(`🚀 Server running on %s, see http://localhost:%s & for healthCheck see http://localhost:%s/healthCheck`, port, port, port)

	// Start server
	app.Listen(fmt.Sprintf(":%s", port))

}
