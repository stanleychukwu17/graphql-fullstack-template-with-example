package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/configs"
)

// Your function to sign JWT
func SignJWT(payload map[string]interface{}, days int) (string, error) {
	// pemData := os.Getenv("PRIVATE_KEY")
	privateKey := []byte(configs.Envs.JWT_SECRET)

	// Convert the duration string "7d" to time.Duration
	expiresIn := time.Duration(days*24) * time.Hour

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
