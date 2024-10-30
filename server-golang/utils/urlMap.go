package utils

type HealthCheck struct {
	Home        string
	AccessToken string
}

type Users struct {
	Login       string
	Register    string
	Logout      string
	CleanTestDB string
}
type UrlMapStruct struct {
	HealthCheck HealthCheck
	Users       Users
}

func GetUrlMap() UrlMapStruct {
	return UrlMapStruct{
		HealthCheck: HealthCheck{
			Home:        "/healthCheck",
			AccessToken: "/healthCheck/accessToken",
		},
		Users: Users{
			Login:       "/users/loginUser",
			Register:    "/users/registerUser",
			Logout:      "/users/logout",
			CleanTestDB: "/users/testing-database-cleanup",
		},
	}
}
