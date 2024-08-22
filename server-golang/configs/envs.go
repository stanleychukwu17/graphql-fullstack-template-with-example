package configs

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type EnvLoader interface {
	Load() error
}

type realEnvLoader struct{}

func (realEnvLoader) Load() error {
	if os.Getenv("ENV") == "test" {
		return godotenv.Load("../.env.test")
	} else {
		return godotenv.Load()
	}
}

type Config struct {
	ENV        string
	PORT       string
	JWT_SECRET string
	JWT_TIME_1 int
	JWT_TIME_2 int
}

var Envs, _ = InitConfig(realEnvLoader{})

func InitConfig(loader EnvLoader) (Config, error) {
	err := loader.Load()
	if err != nil {
		return Config{}, err
	}

	return Config{
		ENV:        GetEnv("ENV", "should-be-fixed"),
		PORT:       GetEnv("PORT", "4000"),
		JWT_SECRET: GetEnv("JWT_SECRET", "not-a-secret-any-more-is-it?"),
		JWT_TIME_1: GetEnvAsInt("JWT_TIME_1", 7),
		JWT_TIME_2: GetEnvAsInt("JWT_TIME_2", 365),
	}, nil
}

// Gets the env by key or fallbacks
func GetEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}

func GetEnvAsInt(key string, fallback int) int {
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
