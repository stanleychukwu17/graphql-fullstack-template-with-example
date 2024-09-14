package services

import (
	"log"

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
	if err != nil {
		return "", err
	}

	// Convert hashed password to a string and return
	return string(hashedPassword), nil
}

// VerifyPassword checks if the provided password matches the hashed password.
func (u *UserServiceStruct) VerifyPassword(hashedPassword, password string) bool {
	// Convert password to a byte slice
	bytePassword := []byte(password)

	// Compare the hashed password with the provided password
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), bytePassword)
	return err == nil
}

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
	err := u.DB.Raw("INSERT INTO users_session (user_id, fake_id, active, created_at) VALUES (?, ?, 'yes', now())", userId, 0).Scan(&uSession).Error
	if err != nil {
		log.Fatalln(err.Error())
		return uSession
	}

	// fetch the current active session
	u.DB.Raw("SELECT * FROM users_session WHERE user_id = ? and active = 'yes' LIMIT 1", userId).Scan(&uSession)
	uSession.Msg = "okay"
	sessionId := uSession.ID
	new_fake_id := utils.Generate_fake_id(int(sessionId)) // Generate a new fake_id

	// updates the session created with the new fake_id
	err = u.DB.Raw("UPDATE users_session SET fake_id = ? WHERE id = ?", new_fake_id, sessionId).Scan(&uSession).Error
	if err != nil {
		log.Fatalln(err.Error())
	}

	uSession.FakeId = int(new_fake_id)
	return uSession
}
