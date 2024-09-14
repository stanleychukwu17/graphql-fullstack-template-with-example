package database

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/middleware"
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

	// Create a CORS middleware instance
	allowedUrl := os.Getenv("ALLOWED_URL")
	corsConfig := cors.Config{
		AllowHeaders:     "Origin, Content-Type, Accept, Content-Length, Accept-Language, Accept-Encoding, Connection, Access-Control-Allow-Origin",
		AllowOrigins:     fmt.Sprintf("%s, http://main-site.com", allowedUrl),
		AllowCredentials: true,
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
	}

	//CORS middlewares
	app.Use(cors.New(corsConfig)) // enable CORS

	// deserializer middleware
	item := middleware.DeserializeStruct{DB: db}
	app.Use(item.DeserializeUser)

	// setup the routes
	routes.SetUpRoutes(app, db)

	return app, db, nil
}
