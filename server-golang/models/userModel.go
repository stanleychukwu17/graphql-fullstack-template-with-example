package models

import (
	"time"
)

type User struct {
	ID        uint16    `gorm:"primaryKey;type:smallint" json:"id,omitempty"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name,omitempty"`
	Username  string    `gorm:"uniqueIndex;type:varchar(100);not null" json:"username,omitempty"`
	Email     string    `gorm:"uniqueIndex;type:varchar(100);not null" json:"email,omitempty"`
	Password  string    `gorm:"type:varchar(100);not null" json:"password,omitempty"`
	Gender    string    `gorm:"type:varchar(100);not null" json:"gender,omitempty"`
	CreatedAt time.Time `gorm:"type:datetime(0);not null;autoCreateTime" json:"created_at,omitempty"`
	TimeZone  string    `gorm:"type:varchar(100);not null;default:'Africa/Lagos'" json:"timezone,omitempty"`
}

type UsersSession struct {
	ID        uint32    `gorm:"primaryKey;type:int unsigned" json:"id,omitempty"`
	FakeId    uint32    `gorm:"uniqueIndex;type:int unsigned" json:"fake_id,omitempty"`
	UserId    uint16    `gorm:"type:smallint;index" json:"user_id,omitempty"`
	Active    string    `gorm:"type:varchar(100);not null;default:'yes'" json:"active,omitempty"`
	CreatedAt time.Time `gorm:"type:date;not null;" json:"created_at,omitempty"`
}

// TableName overrides the default table name for the UsersSession struct
func (UsersSession) TableName() string {
	return "users_session"
}
