package models

import (
	"time"
)

type User struct {
	ID       uint16 `gorm:"primaryKey;type:smallint" json:"id,omitempty"`
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

type UsersSession struct {
	ID        int       `gorm:"primaryKey;type:int" json:"id,omitempty"`
	FakeId    int       `gorm:"uniqueIndex;type:int" json:"fake_id,omitempty"`
	UserId    int16     `gorm:"type:smallint;index" json:"user_id,omitempty"`
	Active    string    `gorm:"type:varchar(100);not null;default:'yes'" json:"active,omitempty"`
	CreatedAt time.Time `gorm:"type:date;not null;" json:"created_at,omitempty"`
}

// TableName overrides the default table name for the UsersSession struct
func (UsersSession) TableName() string {
	return "users_session"
}
