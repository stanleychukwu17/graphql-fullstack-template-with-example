package utils

import "golang.org/x/crypto/bcrypt"

// export const generate_fake_id = (id:number) => {
//     // Generate a random number between 100 and 999 (inclusive of 100, exclusive of 999)
//     const randomNumber = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
//     const new_fake_id = `${id}${randomNumber}`
//     return Number(new_fake_id);
// }

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
