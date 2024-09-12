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

type currentTimeStruct struct {
	Date       string    `json:"date"`
	ParsedDate time.Time `json:"parsedDate"`
	DateTime   string    `json:"dateTime"`
}

func Return_the_current_time_of_this_timezone(timezone string) (currentTimeStruct, error) {
	// Load a specific time zone location
	// You can find time zone names in the IANA Time Zone Database.
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		return currentTimeStruct{}, fmt.Errorf("error loading timezone time: %v", err)
	}

	// Get the current time in UTC
	currentTime := time.Now().UTC()

	// Convert the current time to the desired time zone
	timezoneTime := currentTime.In(loc)
	date_time_layout := "2006-01-02 15:04:05"
	date_layout := "2006-01-02"

	// Format the time to the timezone
	fmtDate := timezoneTime.Format(date_layout)
	parsedDate, _ := time.Parse(date_layout, fmtDate)
	fmtTime := timezoneTime.Format(date_time_layout)

	timeRet := currentTimeStruct{
		Date:       fmtDate,
		ParsedDate: parsedDate,
		DateTime:   fmtTime,
	}
	return timeRet, nil
}
