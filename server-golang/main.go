package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/configs"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/routes"
)

// set up new fiber application
func setup() (*fiber.App, *gorm.DB, error) {
	// establish database connection
	db, err := database.NewConnection("postgres")
	if err != nil {
		return nil, nil, fmt.Errorf("error connecting to database: %v", err)
	}

	// migrate the database, create tables if they don't exist
	err = db.AutoMigrate(&models.User{}, &models.UsersSession{})
	if err != nil {
		return nil, nil, fmt.Errorf("failed to migrate database: %v", err)
	}

	// set up fiber application
	app := fiber.New()
	routes.SetUpRoutes(app, db)

	return app, db, nil
}

func main() {
	app, _, err := setup()
	if err != nil {
		log.Fatalf("Failed to set up: %v", err)
	}

	// Start server
	port := configs.Envs.PORT
	fmt.Printf(`🚀 Server running on %s, see http://localhost:%s & for healthCheck see http://localhost:%s/healthCheck`, port, port, port)
	app.Listen(fmt.Sprintf(":%s", port))
}
