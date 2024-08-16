package models

import (
	"time"
)

type User struct {
	ID         uint16    `gorm:"primaryKey;type:smallint" json:"id,omitempty"`
	Name       string    `gorm:"uniqueIndex;type:varchar(100);not null" json:"name,omitempty"`
	Username   string    `gorm:"uniqueIndex;type:varchar(100);not null" json:"username,omitempty"`
	Email      string    `gorm:"uniqueIndex;type:varchar(100);not null" json:"email,omitempty"`
	Password   string    `gorm:"type:varchar(100);not null" json:"password,omitempty"`
	Gender     string    `gorm:"type:varchar(100);not null" json:"gender,omitempty"`
	Created_at time.Time `json:"created_at,omitempty"`
}
