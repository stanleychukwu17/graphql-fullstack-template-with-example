package utils

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Your function to sign JWT
func SignJWT(payload map[string]interface{}, days string) (string, error) {
	privateKey := []byte(os.Getenv("JWT_SECRET"))

	// Convert the duration string "7d" to time.Duration
	total_days, _ := strconv.Atoi(days)
	expiresIn := time.Duration(total_days*24) * time.Hour

	// Create a new token object, specifying signing method and claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"exp":  time.Now().Add(expiresIn).Unix(),
		"data": payload,
	})

	// Sign the token with the private key
	signedToken, err := token.SignedString(privateKey)
	if err != nil {
		return "", fmt.Errorf("error signing token: %v", err)
	}

	return signedToken, nil
}
