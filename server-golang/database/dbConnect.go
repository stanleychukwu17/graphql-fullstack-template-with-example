package database

import (
	"fmt"
	"os"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func connect_to_development_database(which_db string) (db *gorm.DB, err error) {
	var dsn string

	if which_db == "postgres" {
		DB_USER := os.Getenv("POSTGRES_DB_USER")
		DB_PASSWORD := os.Getenv("POSTGRES_DB_PASSWORD")
		DB_NAME := os.Getenv("DB_NAME")
		DB_PORT := os.Getenv("POSTGRES_DB_PORT")
		DB_TIMEZONE := os.Getenv("POSTGRES_DB_TIMEZONE")

		dsn = fmt.Sprintf("host=localhost user=%v password=%v dbname=%v port=%v sslmode=disable TimeZone=%v", DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_TIMEZONE)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else if which_db == "mysql" {
		DB_USER := os.Getenv("MYSQL_DB_USER")
		DB_PASSWORD := os.Getenv("MYSQL_DB_PASSWORD")
		DB_NAME := os.Getenv("DB_NAME")
		DB_PORT := os.Getenv("MYSQL_DB_PORT")
		DB_TIMEZONE := os.Getenv("MYSQL_DB_TIMEZONE")

		dsn = fmt.Sprintf("%s:%s@tcp(localhost:%s)/%s?charset=utf8mb4&parseTime=True&loc=%s", DB_USER, DB_PASSWORD, DB_PORT, DB_NAME, DB_TIMEZONE)
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	}

	return
}

func connect_to_continuous_integration_database(which_db string) (db *gorm.DB, err error) {
	dsn, _, _ := utils.SetupTestDB(which_db)

	if which_db == "postgres" {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else if which_db == "mysql" {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	}
	return
}

func NewConnection(which_db string) (db *gorm.DB, err error) {
	env := os.Getenv("ENV")
	fmt.Println("Environment: ", env)
	fmt.Printf("Connecting to %v database \n", which_db)

	if env == "test" || env == "development" {
		db, err := connect_to_development_database(which_db)
		return db, err
	} else if env == "continuous_integration" {
		db, err := connect_to_continuous_integration_database(which_db)
		return db, err
	} else {
		return nil, nil
	}

	// else if env == "cd" {
	// 	fmt.Println("Connecting to continuous deployment database")
	// } else if env == "production" {
	// 	fmt.Println("Connecting to production database")
	// }
}
