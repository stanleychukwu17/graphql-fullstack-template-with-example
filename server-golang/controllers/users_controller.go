package controllers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

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

	// check to make sure all the fields are valid and working properly
	result := validate_new_user_fields(user)
	if result["msg"] == "bad" {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(
			utils.Show_bad_message(result["cause"]),
		)
	}

	// check to see if the email already or username exist
	var found_id uint
	err := u.DB.Raw("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1", user.Username, user.Email).Scan(&found_id).Error
	if err != nil {
		return err
	}
	if found_id > 0 {
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(
			utils.Show_bad_message("Email or username already exist"),
		)
	}

	// hash the password using bcrypt
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	// save the new user to the database
	err = u.DB.Create(&user).Error
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(
		utils.Show_good_message("User created successfully from controller"),
	)
}

func validate_new_user_fields(user models.User) map[string]string {
	// Validate the user fields

	if len(user.Name) <= 3 {
		return utils.Show_bad_message("Name must be longer than 3 characters")
	}

	if len(user.Username) <= 3 {
		return utils.Show_bad_message("Username must be longer than 3 characters")
	}

	if len(user.Email) <= 5 {
		return utils.Show_bad_message("invalid email received")
	}

	if len(user.Password) <= 5 {
		return utils.Show_bad_message("password is too short")
	}

	if user.Gender != "male" && user.Gender != "female" {
		return utils.Show_bad_message("invalid gender received")
	}

	return utils.Show_good_message("All fields are valid")
}
