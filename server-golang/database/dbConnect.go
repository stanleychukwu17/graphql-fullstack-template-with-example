package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/docker/go-connections/nat"
	testContainers "github.com/testcontainers/testcontainers-go"
	mysqlContainer "github.com/testcontainers/testcontainers-go/modules/mysql"
	postgresContainer "github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

func SetupTestDB(which_db string) (string, testContainers.Container, error) {
	var db_container testContainers.Container
	var err error

	ctx := context.Background()

	fmt.Printf("about to start %v testing container... for %v environment  \n", which_db, os.Getenv("ENV"))

	if which_db == "postgres" {
		db_user := "postgres"
		db_password := "password"
		db_port := os.Getenv("POSTGRES_DB_PORT")
		db_name := os.Getenv("DB_NAME")
		db_timezone := os.Getenv("POSTGRES_DB_TIMEZONE")

		db_container, err = postgresContainer.Run(ctx,
			"postgres:16.3-alpine3.20",
			postgresContainer.WithDatabase(db_name),
			postgresContainer.WithUsername(db_user),
			postgresContainer.WithPassword(db_password),
			testContainers.WithWaitStrategy(
				wait.ForLog("database system is ready to accept connections").
					WithOccurrence(2).
					WithStartupTimeout(5*time.Second)),
		)
		if err != nil {
			log.Fatalf("failed to start container: %s", err)
		}

		fmt.Printf("%v Container started \n", which_db)
		// formats the connection string
		dsn := fmt.Sprintf("host=localhost user=%v password=%v dbname=%v port=%v sslmode=disable TimeZone=%v", db_user, db_password, db_name, db_port, db_timezone)

		// Clean up the container
		defer func() {
			if err := db_container.Terminate(ctx); err != nil {
				log.Fatalf("failed to terminate container: %s", err)
			} else {
				fmt.Print("Container terminated\n")
			}
		}()

		return dsn, db_container, nil
	} else if which_db == "mysql" {
		db_user := "root"
		db_password := "root"
		db_port := os.Getenv("POSTGRES_DB_PORT")
		db_name := os.Getenv("DB_NAME")
		db_timezone := os.Getenv("POSTGRES_DB_TIMEZONE")

		db_container, err := mysqlContainer.Run(ctx,
			"mysql:8.0-bullseye",
			mysqlContainer.WithDatabase(db_name),
			mysqlContainer.WithUsername(db_user),
			mysqlContainer.WithPassword(db_password),
			testContainers.WithWaitStrategy(
				wait.ForListeningPort(nat.Port(db_port)).
					WithStartupTimeout(30*time.Second)),
		)
		if err != nil {
			log.Fatalf("failed to start container: %s", err)
		}

		fmt.Printf("%v Container started \n", which_db)
		dsn := fmt.Sprintf("%s:%s@tcp(localhost:%s)/%s?charset=utf8mb4&parseTime=True&loc=%s", db_user, db_password, db_port, db_name, db_timezone)

		// Clean up the container
		defer func() {
			if err := db_container.Terminate(ctx); err != nil {
				log.Fatalf("failed to terminate container: %s", err)
			} else {
				fmt.Print("Container terminated\n")
			}
		}()

		return dsn, db_container, nil
	} else {
		panic("Invalid database type")
	}
}

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
	dsn, _, _ := SetupTestDB(which_db)

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
	// else if env == "cd" {} else if env == "production" {}
}
