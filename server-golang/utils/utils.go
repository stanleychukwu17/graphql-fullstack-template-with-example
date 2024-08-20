package utils

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type FieldRequirement struct {
	Key    string `json:"key"`
	Length int    `json:"length"`
	Msg    string `json:"msg"`
}

func Generate_fake_id(id int) int {
	// Create a new random source
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	// Generate a random number between 100 and 999
	randomNumber := r.Intn(900) + 100

	new_fake_id, _ := strconv.Atoi(fmt.Sprintf("%v%v", id, randomNumber))
	return new_fake_id
}

// ShowBadMessage generates a standardized error message map.
func Show_bad_message(cause string) map[string]string {
	return map[string]string{
		"msg":   "bad",
		"cause": cause,
	}
}

func Show_good_message(cause string) map[string]string {
	return map[string]string{
		"msg":   "okay",
		"cause": cause,
	}
}

// HashPassword hashes the password with a specified cost factor.
func HashPassword(password string) (string, error) {
	// Convert password to a byte slice
	bytePassword := []byte(password)

	// Generate a hashed password with default cost factor
	hashedPassword, err := bcrypt.GenerateFromPassword(bytePassword, bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	// Convert hashed password to a string and return
	return string(hashedPassword), nil
}

// VerifyPassword checks if the provided password matches the hashed password.
func VerifyPassword(hashedPassword, password string) bool {
	// Convert password to a byte slice
	bytePassword := []byte(password)

	// Compare the hashed password with the provided password
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), bytePassword)
	return err == nil
}

/*
func main() {
    password := "mySecurePassword"

    // Hash the password
    hashedPassword, err := HashPassword(password)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Hashed Password:", hashedPassword)

    // Verify the password
    isMatch := VerifyPassword(hashedPassword, password)
    if isMatch {
        fmt.Println("Password is correct")
    } else {
        fmt.Println("Password is incorrect")
    }
}
*/

func Check_if_required_fields_are_present(list []FieldRequirement) (bool, string) {
	found_error, error_msg := false, ""

	for _, field := range list {
		if len(field.Key) <= field.Length {
			found_error = true
			error_msg = field.Msg
			break
		}
	}

	return found_error, error_msg
}
