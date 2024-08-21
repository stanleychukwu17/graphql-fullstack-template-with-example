package controllers

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/configs"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
)

type UsersController struct {
	DB *gorm.DB
}

// route to register a new user
func (u *UsersController) RegisterUser(ctx *fiber.Ctx) error {
	user := models.User{}

	// Parse the request body & bind it to the book struct, the context.BodyParser(&user), is parsing the request body from json to go struct.. Fiber does this internally, be default, Golang does not understand json
	if err := ctx.BodyParser(&user); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(
			utils.Show_bad_message("Invalid request body"),
		)
	}

	// checks to make sure all fields are not less than zero in length
	rq_fields := []utils.FieldRequirement{
		{Key: user.Name, Length: 3, Msg: "Name must be longer than 3 characters"},
		{Key: user.Username, Length: 3, Msg: "Username must be longer than 3 characters"},
		{Key: user.Email, Length: 5, Msg: "Email must be longer than 5 characters"},
		{Key: user.Password, Length: 5, Msg: "Password must be longer than 5 characters"},
		{Key: user.Gender, Length: 3, Msg: "Gender must be either male or female"},
	}
	found_error, error_msg := utils.Check_if_required_fields_are_present(rq_fields)
	if found_error {
		return ctx.Status(fiber.StatusBadRequest).JSON(
			utils.Show_bad_message(error_msg),
		)
	}

	// check to see if the email already or username exist
	var found_id uint
	err := u.DB.Raw("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1", user.Username, user.Email).Scan(&found_id).Error
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(utils.Show_bad_message(err.Error()))
	}
	if found_id > 0 {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(
			utils.Show_bad_message("Email or username already exist"),
		)
	}

	// hash the password using bcrypt
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(utils.Show_bad_message(err.Error()))
	}
	user.Password = hashedPassword

	// save the new user to the database
	user.TimeZone = os.Getenv("TIMEZONE")
	err = u.DB.Create(&user).Error
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(utils.Show_bad_message(err.Error()))
	}

	return ctx.Status(fiber.StatusCreated).JSON(
		utils.Show_good_message("User created successfully from controller"),
	)
}

func (u *UsersController) LoginThisUser(ctx *fiber.Ctx) error {
	user := models.User{}
	userDts := models.User{}
	envs := configs.Envs

	// Parse the request body & bind it to the book struct
	if err := ctx.BodyParser(&user); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(
			utils.Show_bad_message("Invalid request body"),
		)
	}

	// checks to make sure all fields are not less than zero in length
	rq_fields := []utils.FieldRequirement{
		{Key: user.Username, Length: 3, Msg: "Username must be longer than 3 characters"},
		{Key: user.Password, Length: 5, Msg: "Password must be longer than 5 characters"},
	}
	found_error, error_msg := utils.Check_if_required_fields_are_present(rq_fields)
	if found_error {
		return ctx.Status(fiber.StatusBadRequest).JSON(
			utils.Show_bad_message(error_msg),
		)
	}

	// checks to see if the user exists in our database
	err := u.DB.Raw("SELECT id, name, username, password FROM users WHERE username = ? or email = ? LIMIT 1", user.Username, user.Username).Scan(&userDts).Error
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(utils.Show_bad_message(err.Error()))
	}

	// checks to see if any user was found
	if userDts.ID == 0 {
		return ctx.Status(fiber.StatusNotFound).JSON(utils.Show_bad_message("User not found"))
	}

	// compare the password received to see if it is a valid password
	validPassword := utils.VerifyPassword(userDts.Password, user.Password)
	if !validPassword {
		return ctx.Status(fiber.StatusUnauthorized).JSON(utils.Show_bad_message("Invalid credentials"))
	}

	// creates a new session for the user
	sessionDts := u.createSession(userDts.ID)

	// create access and refresh tokens
	payload := map[string]interface{}{
		"session_fid": int(sessionDts.FakeId),
		"created_at":  strings.Split(fmt.Sprintf("%v", sessionDts.CreatedAt), " ")[0],
	}

	// retrieve the accessToken and the refreshToken
	accessToken, err := utils.SignJWT(payload, envs.JWT_TIME_1)
	refreshToken, _ := utils.SignJWT(payload, envs.JWT_TIME_2)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(utils.Show_bad_message(err.Error()))
	}

	// return the access and refresh tokens
	response := map[string]string{
		"Msg":          "okay",
		"Name":         userDts.Name,
		"AccessToken":  accessToken,
		"RefreshToken": refreshToken,
	}
	return ctx.Status(fiber.StatusOK).JSON(response)
}

// createSession creates a new session for the user_id received
type checkSession struct {
	Msg string `json:"msg"`
	models.UsersSession
}

func (u *UsersController) createSession(userId uint16) checkSession {
	uSession := checkSession{}

	// checks to see if there are any active sessions for this user
	u.DB.Raw("SELECT * FROM users_session WHERE user_id = ? and active = 'yes' LIMIT 1", userId).Scan(&uSession)
	if uSession.ID > 0 && uSession.Active == "yes" {
		uSession.Msg = "okay"
		return uSession
	}

	// create a new session and return it
	err := u.DB.Raw("INSERT INTO users_session (user_id, fake_id, active, created_at) VALUES (?, ?, 'yes', now())", userId, 0).Scan(&uSession).Error
	if err != nil {
		log.Fatalln(err.Error())
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

	uSession.FakeId = uint32(new_fake_id)
	return uSession
}
