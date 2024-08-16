package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func NewConnection() (db *gorm.DB, err error) {
	got_err := godotenv.Load()
	if got_err != nil {
		log.Fatalf("Error loading .env file: %v", got_err)
	}

	DB_USER := os.Getenv("MYSQL_DB_USER")
	DB_PASSWORD := os.Getenv("MYSQL_DB_PASSWORD")
	DB_NAME := os.Getenv("MYSQL_DB_NAME")
	DB_PORT := os.Getenv("MYSQL_DB_PORT")
	DB_TIMEZONE := os.Getenv("MYSQL_DB_TIMEZONE")

	// connect to the postgres database
	// dsn := fmt.Sprintf("host=localhost user=%v password=%v dbname=%v port=%v sslmode=disable TimeZone=%v", DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_TIMEZONE)

	// Construct the DSN (Data Source Name) string for MySQL
	dsn := fmt.Sprintf("%s:%s@tcp(localhost:%s)/%s?charset=utf8mb4&parseTime=True&loc=%s", DB_USER, DB_PASSWORD, DB_PORT, DB_NAME, DB_TIMEZONE)

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

	return
}
