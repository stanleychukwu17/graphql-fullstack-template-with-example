package configs

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	PUBLIC_HOST string
	PORT        string
	JWT_SECRET  string
	JWT_TIME_1  int
	JWT_TIME_2  int
}

var Envs = initConfig()

func initConfig() Config {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	return Config{
		PUBLIC_HOST: getEnv("PUBLIC_HOST", "http://localhost"),
		PORT:        getEnv("PORT", "4000"),
		JWT_SECRET:  getEnv("JWT_SECRET", "not-a-secret-any-more-is-it?"),
		JWT_TIME_1:  getEnvAsInt("JWT_TIME_1", 7),
		JWT_TIME_2:  getEnvAsInt("JWT_TIME_2", 365),
	}
}

// Gets the env by key or fallbacks
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	valueStr, exists := os.LookupEnv(key)
	if !exists {
		return fallback
	}

	value, err := strconv.Atoi(valueStr)
	if err != nil {
		log.Printf("Error converting environment variable %s to int: %v", key, err)
		return fallback
	}

	return value
}
