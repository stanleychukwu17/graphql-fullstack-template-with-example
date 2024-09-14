package utils

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// -
// START-- definition of types
type LoginClaims struct {
	Data struct {
		SessionFid interface{} `json:"session_fid"`
		CreatedAt  string      `json:"created_at"`
	} `json:"data"`
	jwt.RegisteredClaims // For standard JWT claims like exp, iat, etc.
}

// END-- definition of types
// -

// Your function to sign JWT
func SignJWT(payload map[string]interface{}, days string) (string, error) {
	privateKey := []byte(os.Getenv("JWT_SECRET"))

	// Convert the duration to type of time.Duration
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

func VerifyJwt(token string) (*LoginClaims, error) {
	publicKey := []byte(os.Getenv("JWT_SECRET"))

	// Verify the token
	verifiedToken, err := jwt.ParseWithClaims(token, &LoginClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return publicKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("error verifying token: %v", err)
	}

	if !verifiedToken.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := verifiedToken.Claims.(*LoginClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}
