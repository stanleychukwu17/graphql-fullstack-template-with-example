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
			Login:       "/users1/loginUser",
			Register:    "/users1/registerUser",
			Logout:      "/users1/logout",
			CleanTestDB: "/users1/testing-database-cleanup",
		},
	}
}
