package utils

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"
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
