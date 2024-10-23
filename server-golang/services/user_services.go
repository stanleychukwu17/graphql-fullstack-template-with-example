package services

import (
	"time"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// define the interface for user services
type UserServices interface {
	CreateUser(user *models.User) error
	FindUserByUsernameOrEmail(username string, email string) *models.User
	HashPassword(password string) (string, error)
	VerifyPassword(hashedPassword, password string) bool
	CreateSession(userId int) CheckSession
	TestingDatabaseCleanUp()
}

// define the struct for that implements the user services
type UserServiceStruct struct {
	DB *gorm.DB
}

func (u *UserServiceStruct) CreateUser(user *models.User) error {
	return u.DB.Create(&user).Error
}

func (u *UserServiceStruct) FindUserByUsernameOrEmail(username string, email string) *models.User {
	// search for the user in the database
	user := models.User{}

	if len(username) > 0 {
		u.DB.Where("username = ?", username).First(&user)
	}

	if len(email) > 0 {
		u.DB.Where("email = ?", email).First(&user)
	}

	return &user
}

func (u *UserServiceStruct) HashPassword(password string) (string, error) {
	// Convert password to a byte slice
	bytePassword := []byte(password)

	// Generate a hashed password with default cost factor
	hashedPassword, err := bcrypt.GenerateFromPassword(bytePassword, bcrypt.DefaultCost)

	// Convert hashed password to a string and return
	return string(hashedPassword), err
}

// VerifyPassword checks if the provided password matches the hashed password.
func (u *UserServiceStruct) VerifyPassword(hashedPassword, password string) bool {
	// Convert password to a byte slice
	bytePassword := []byte(password)

	// Compare the hashed password with the provided password
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), bytePassword)
	return err == nil
}

// --START-- sessions
// CheckSession struct
type CheckSession struct {
	Msg string `json:"msg"`
	models.UsersSession
	CreatedAt string `json:"created_at"`
}

// createSession creates a new session for the user_id received
func (u *UserServiceStruct) CreateSession(userId int) CheckSession {
	uSession := CheckSession{}

	// checks to see if there are any active sessions for this user
	u.DB.Raw("SELECT * FROM users_session WHERE user_id = ? and active = 'yes' LIMIT 1", userId).Scan(&uSession)
	if uSession.ID > 0 && uSession.Active == "yes" {
		uSession.Msg = "okay"
		return uSession
	}

	// creates a new session
	err := u.DB.Exec("INSERT INTO users_session (user_id, fake_id, active, created_at) VALUES (?, ?, 'yes', now())", userId, 0).Error
	if err == nil {
		// fetch the current active session
		u.DB.Raw("SELECT * FROM users_session WHERE user_id = ? and active = 'yes' LIMIT 1", userId).Scan(&uSession)
		uSession.Msg = "okay"
		sessionId := uSession.ID
		new_fake_id := utils.Generate_fake_id(sessionId) // Generate a new fake_id

		// updates the session created with the new fake_id
		u.DB.Exec("UPDATE users_session SET fake_id = ? WHERE id = ?", new_fake_id, sessionId)

		uSession.FakeId = new_fake_id
	}

	return uSession
}

func (u *UserServiceStruct) TestingDatabaseCleanUp() {
	users := []*models.User{}

	// we want to delete only test account that were created the previous day
	currentDate := time.Now()                        // Get the current date and time
	twoDaysAgo := currentDate.AddDate(0, 0, -1)      // Subtract 2 days - AddDate(years, months, days)
	formattedDate := twoDaysAgo.Format("2006-01-02") // Format the date to "YYYY-MM-DD"

	err := u.DB.Raw("SELECT id, username, email FROM users WHERE username LIKE ? AND created_at <= ? ", "%test-%", formattedDate).Scan(&users).Error
	if err == nil {
		for _, user := range users {
			u.DB.Exec("DELETE FROM users WHERE id = ? limit 1", user.ID)
			u.DB.Exec("DELETE FROM users_session WHERE user_id = ? limit 1", user.ID)
		}
	}

}

// --END-- sessions
