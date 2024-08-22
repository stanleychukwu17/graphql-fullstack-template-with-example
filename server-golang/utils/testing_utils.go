package utils

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/docker/go-connections/nat"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/mysql"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

// sets up a postgres container or mysql container for testing
func SetupTestDB(which_db string) (string, testcontainers.Container, error) {
	var db_container testcontainers.Container
	var err error

	ctx := context.Background()

	fmt.Printf("about to start %v testing container... for %v environment  \n", which_db, os.Getenv("ENV"))

	if which_db == "postgres" {
		db_user := "postgres"
		db_password := "password"
		db_port := os.Getenv("POSTGRES_DB_PORT")
		db_name := os.Getenv("DB_NAME")
		db_timezone := os.Getenv("POSTGRES_DB_TIMEZONE")

		db_container, err = postgres.Run(ctx,
			"postgres:16.3-alpine3.20",
			postgres.WithDatabase(db_name),
			postgres.WithUsername(db_user),
			postgres.WithPassword(db_password),
			testcontainers.WithWaitStrategy(
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

		db_container, err := mysql.Run(ctx,
			"mysql:8.0-bullseye",
			mysql.WithDatabase(db_name),
			mysql.WithUsername(db_user),
			mysql.WithPassword(db_password),
			testcontainers.WithWaitStrategy(
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
