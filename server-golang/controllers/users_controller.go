package controllers

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/models"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/services"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
)

type UsersController struct {
	DB           *gorm.DB
	UserServices services.UserServices
}

// route to register a new user
func (u *UsersController) RegisterUser(ctx *fiber.Ctx) error {
	user := models.User{}

	// Parse the request body
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
	check_usr := u.UserServices.FindUserByUsernameOrEmail(user.Username, user.Email)
	if len(check_usr.Username) > 0 {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(
			utils.Show_bad_message("Email or username already exist"),
		)
	}

	// hash the password using bcrypt
	hashedPassword, _ := u.UserServices.HashPassword(user.Password)
	if len(hashedPassword) > 0 {
		user.Password = hashedPassword
	}

	// get the current time for the user timezone
	user.TimeZone = os.Getenv("TIMEZONE")
	currentTime, _ := utils.Return_the_current_time_of_this_timezone(user.TimeZone)
	user.CreatedAt = currentTime.ParsedDate

	// save the new user to the database
	err := u.UserServices.CreateUser(&user)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(utils.Show_bad_message(err.Error()))
	}

	// return a success message
	return ctx.Status(fiber.StatusCreated).JSON(
		utils.Show_good_message("User created successfully from controller"),
	)
}

func (u *UsersController) LoginThisUser(ctx *fiber.Ctx) error {
	user := models.User{}
	userDts := &models.User{}

	// Parse the request body
	if err := ctx.BodyParser(&user); err != nil {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(
			utils.Show_bad_message("Invalid request body"),
		)
	}

	// checks to make sure all fields are not shorter than what is required
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
	userDts = u.UserServices.FindUserByUsernameOrEmail(user.Username, user.Username)
	if len(userDts.Username) == 0 {
		return ctx.Status(fiber.StatusNotFound).JSON(utils.Show_bad_message("User not found"))
	}

	// compare the password received to see if it is a valid password
	validPassword := u.UserServices.VerifyPassword(userDts.Password, user.Password)
	if !validPassword {
		return ctx.Status(fiber.StatusUnauthorized).JSON(utils.Show_bad_message("Invalid credentials"))
	}

	// creates a new session for the user
	sessionDts := u.UserServices.CreateSession(userDts.ID)

	// create access and refresh tokens
	payload := map[string]interface{}{
		"session_fid": int(sessionDts.FakeId),
		"created_at":  strings.Split(fmt.Sprintf("%v", sessionDts.CreatedAt), " ")[0],
	}

	// retrieve the accessToken and the refreshToken
	accessToken, _ := utils.SignJWT(payload, os.Getenv("JWT_TIME_1"))
	refreshToken, _ := utils.SignJWT(payload, os.Getenv("JWT_TIME_2"))

	// return the access and refresh tokens
	response := map[string]string{
		"Msg":          "okay",
		"Name":         userDts.Name,
		"AccessToken":  accessToken,
		"RefreshToken": refreshToken,
	}

	return ctx.Status(fiber.StatusOK).JSON(response)
}
