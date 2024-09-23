package models

import (
	"fmt"
	"os"
	"time"
)

type User struct {
	ID       int    `gorm:"primaryKey;type:int" json:"id,omitempty"`
	Name     string `gorm:"type:varchar(100);not null" json:"name,omitempty"`
	Username string `gorm:"uniqueIndex;type:varchar(100);not null" json:"username,omitempty"`
	Email    string `gorm:"uniqueIndex;type:varchar(100);not null" json:"email,omitempty"`
	Password string `gorm:"type:varchar(100);not null" json:"password,omitempty"`
	Gender   string `gorm:"type:varchar(100);not null" json:"gender,omitempty"`
	// removed the datetime(0), it was not compatible with postgres, only worked with mysql
	// better to leave it empty so that gorm can use the default type
	// CreatedAt time.Time `gorm:"type:datetime(0);not null;autoCreateTime" json:"created_at,omitempty"`
	CreatedAt time.Time `gorm:"not null;type:date;autoCreateTime" json:"created_at,omitempty"`
	TimeZone  string    `gorm:"type:varchar(100);not null;default:'Africa/Lagos'" json:"timezone,omitempty"`
}

func (u *User) ToJson() string {
	// checks if there is a default timezone, otherwise use Africa/Lagos
	if len(u.TimeZone) == 0 {
		timezone, exists := os.LookupEnv("TIMEZONE")
		if exists {
			u.TimeZone = timezone
		}
	}

	// format the body to json readable string
	body := fmt.Sprintf(`{
		"name": "%s",
		"username": "%s",
		"email": "%s",
		"password": "%s",
		"gender": "%s",
		"timezone": "%s"
	}`, u.Name, u.Username, u.Email, u.Password, u.Gender, u.TimeZone)

	return body
}

type UsersSession struct {
	ID        int       `gorm:"primaryKey;type:int" json:"id,omitempty"`
	FakeId    int       `gorm:"type:int;index" json:"fake_id,omitempty"`
	UserId    int16     `gorm:"type:smallint;index" json:"user_id,omitempty"`
	Active    string    `gorm:"type:varchar(100);not null;default:'yes';index" json:"active,omitempty"`
	CreatedAt time.Time `gorm:"type:date;not null;index" json:"created_at,omitempty"`
}

// TableName overrides the default table name for the UsersSession struct
func (UsersSession) TableName() string {
	return "users_session"
}
