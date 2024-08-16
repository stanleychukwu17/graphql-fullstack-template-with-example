package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Access environment variables
	port, exists := os.LookupEnv("PORT")
	if !exists {
		log.Fatalf("PORT environment variable is required but not set")
	}

	// Create new Fiber instance
	app := fiber.New()

	// Create GET route on path "/"
	app.Get("/healthCheck", func(context *fiber.Ctx) error {
		return context.SendString("Hello, World!")
	})

	// Print message to console
	fmt.Printf(`🚀 Server running on %s, see http://localhost:%s & for healthCheck see http://localhost:%s/healthCheck`, port, port, port)

	// Start server
	app.Listen(fmt.Sprintf(":%s", port))

}
