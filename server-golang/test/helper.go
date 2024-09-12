package test

import (
	"fmt"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

// BeforeEach is a helper function to load the right environment variables for a
// given test. It loads the .env.test file if the ENV variable is set to "test" or
// "development", and the .env.ci file if the ENV variable is set to
// "continuous_integration" or "production". If the ENV variable is not set, it
// will fail the test.
func BeforeEach(t *testing.T) error {
	godotenv.Load()
	env, exists := os.LookupEnv("ENV")
	bgUser, _ := os.LookupEnv("BG_USER")
	fmt.Printf("this is the value of env: %v : %v \n", env, exists)

	if exists {
		if env == "development" {
			err := godotenv.Load("D:/Sz - projects/0-templates/0-graphql-project-client-and-server/server-golang/.env.test")
			if err != nil {
				t.Fatal("Error loading .env file")
			}

		} else if env == "continuous_integration" || env == "production" {
			if bgUser == "development" {
				godotenv.Load("D:/Sz - projects/0-templates/0-graphql-project-client-and-server/server-golang/.env.test")
			}

			_, port_exists := os.LookupEnv("PORT")
			_, db_exists := os.LookupEnv("DB_NAME")

			if !port_exists || !db_exists {
				t.Fatal("PORT or DB_NAME is not set, please set your env variables")
			}
		} else {
			t.Logf("ENV is not correct, please set your env variable to either test, continuous_integration or production")
			return fmt.Errorf("ENV is not correct, please set your env variable to either test, continuous_integration or production")
		}

		return nil
	} else {
		t.Logf("ENV is not set, please set your env variable to either test, continuous_integration or production")
		return fmt.Errorf("ENV is not set, please set your env variable to either test, continuous_integration or production")
	}
}
