package database

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/routes"
	"gorm.io/gorm"
)

// set up new fiber application
func Setup() (*fiber.App, *gorm.DB, error) {
	// establish database connection
	db, err := NewConnection("mysql") // postgres or mysql
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
