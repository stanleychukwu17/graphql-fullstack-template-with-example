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
	"gorm.io/gorm/logger"

	"github.com/docker/go-connections/nat"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func Setup_continuous_integration_db(which_db string) (string, testcontainers.Container, error) {
	ctx := context.Background()

	fmt.Printf("about to start %v continuous integration container... for %v environment  \n", which_db, os.Getenv("ENV"))

	if which_db == "postgres" {
		db_user := "postgres"
		db_password := "password"
		db_name := os.Getenv("DB_NAME")
		db_port := os.Getenv("POSTGRES_DB_PORT")
		db_timezone := os.Getenv("POSTGRES_DB_TIMEZONE")

		// Create container request
		req := testcontainers.ContainerRequest{
			Image:        "postgres:16.3-alpine3.20",
			ExposedPorts: []string{fmt.Sprintf("%v/tcp", db_port)},
			Env: map[string]string{
				"POSTGRES_USER":     db_user,
				"POSTGRES_PASSWORD": db_password,
				"POSTGRES_DB":       db_name,
			},
			WaitingFor: wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(300 * time.Second),
		}

		// Create and start the container
		container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
			ContainerRequest: req,
			Started:          true,
		})
		if err != nil {
			log.Fatalf("failed to start container: %s", err)
		}

		host, _ := container.Host(ctx)                          // Get container host (IP)
		port, _ := container.MappedPort(ctx, nat.Port(db_port)) // Get mapped port
		dsn := fmt.Sprintf(
			"host=%s user=%v password=%v dbname=%v port=%v sslmode=disable TimeZone=%v",
			host, db_user, db_password, db_name, port.Port(), db_timezone,
		)

		fmt.Printf("Connecting to postgres DB with DSN: %s\n", dsn)
		return dsn, container, nil
	} else if which_db == "mysql" {
		db_user := "root"
		db_password := "root"
		db_name := os.Getenv("DB_NAME")
		db_timezone := os.Getenv("MYSQL_DB_TIMEZONE")
		db_port := os.Getenv("MYSQL_DB_PORT")

		// Create container request
		req := testcontainers.ContainerRequest{
			Image:        "mysql:8.0-bullseye",
			ExposedPorts: []string{fmt.Sprintf("%v/tcp", db_port)},
			Env: map[string]string{
				"MYSQL_ROOT_PASSWORD": db_password,
				"MYSQL_DATABASE":      db_name,
			},
			WaitingFor: wait.ForLog(fmt.Sprintf("port: %v  MySQL Community Server - GPL", db_port)).
				WithStartupTimeout(300 * time.Second),
		}

		// Create and start the container
		container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
			ContainerRequest: req,
			Started:          true,
		})
		if err != nil {
			log.Fatalf("failed to start container: %s", err)
		}

		host, _ := container.Host(ctx)                          // Get container host (IP)
		port, _ := container.MappedPort(ctx, nat.Port(db_port)) // Get mapped port

		dsn := fmt.Sprintf(
			"%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local&loc=%s",
			db_user, db_password, host, port.Port(), db_name, db_timezone,
		)

		fmt.Printf("Connecting to mysql DB with DSN: %s\n", dsn)
		return dsn, container, nil
	} else {
		panic("Invalid database type")
	}
}

func Connect_to_continuous_integration_database(which_db string) (db *gorm.DB, err error) {
	dsn, _, _ := Setup_continuous_integration_db(which_db)

	if which_db == "postgres" {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent), // Only log errors
		})
	} else if which_db == "mysql" {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent), // Only log errors
		})
	}
	return
}

func Connect_to_development_database(which_db string) (db *gorm.DB, err error) {
	var dsn string

	if which_db == "postgres" {
		DB_USER := os.Getenv("POSTGRES_DB_USER")
		DB_PASSWORD := os.Getenv("POSTGRES_DB_PASSWORD")
		DB_NAME := os.Getenv("DB_NAME")
		DB_PORT := os.Getenv("POSTGRES_DB_PORT")
		DB_TIMEZONE := os.Getenv("POSTGRES_DB_TIMEZONE")

		dsn = fmt.Sprintf("host=localhost user=%v password=%v dbname=%v port=%v sslmode=disable TimeZone=%v", DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_TIMEZONE)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent), // Only log errors
		})
	} else if which_db == "mysql" {
		DB_USER := os.Getenv("MYSQL_DB_USER")
		DB_PASSWORD := os.Getenv("MYSQL_DB_PASSWORD")
		DB_NAME := os.Getenv("DB_NAME")
		DB_PORT := os.Getenv("MYSQL_DB_PORT")
		DB_TIMEZONE := os.Getenv("MYSQL_DB_TIMEZONE")

		dsn = fmt.Sprintf("%s:%s@tcp(localhost:%s)/%s?charset=utf8mb4&parseTime=True&loc=%s", DB_USER, DB_PASSWORD, DB_PORT, DB_NAME, DB_TIMEZONE)
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent), // Only log errors
		})
	}

	return
}

func NewConnection(which_db string) (db *gorm.DB, err error) {
	env := os.Getenv("ENV")
	fmt.Println("Environment: ", env)
	fmt.Printf("Connecting to %v database \n", which_db)

	if env == "testing" || env == "development" {
		db, err := Connect_to_development_database(which_db)
		return db, err
	} else if env == "continuous_integration" {
		db, err := Connect_to_continuous_integration_database(which_db)
		return db, err
	}

	return nil, nil
	// else if env == "cd" {} else if env == "production" {}
}
