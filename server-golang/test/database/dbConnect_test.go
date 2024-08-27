package database_test

import (
	"os"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func beforeEach() {
	os.Setenv("ENV", "test")
	godotenv.Load("../../.env.test")
}

func TestSetupTestDB(t *testing.T) {
	// if os.Getenv("ENV") != "continuous_integration" {
	// 	t.Skip("Skipping this test unconditionally")
	// }
	beforeEach()

	dsn, db_container, err := database.SetupTestDB("postgres")

	require.NoError(t, err)
	require.NotNil(t, dsn)
	require.NotNil(t, db_container)

	dsn, db_container, err = database.SetupTestDB("mysql")
	require.NoError(t, err)
	require.NotNil(t, dsn)
	require.NotNil(t, db_container)
}

func TestConnect_to_continuous_integration_database(t *testing.T) {
	beforeEach()
	// if os.Getenv("ENV") != "continuous_integration" {
	// 	t.Skip("Skipping this test unconditionally")
	// }
	postgres_db, err := database.Connect_to_continuous_integration_database("postgres")
	require.NoError(t, err, "Expected no error while connecting to the database")
	require.IsType(t, &gorm.DB{}, postgres_db, "Expected db to be of type *gorm.DB")

	mysql_db, err := database.Connect_to_continuous_integration_database("mysql")
	require.NoError(t, err, "Expected no error while connecting to the database")
	require.IsType(t, &gorm.DB{}, mysql_db, "Expected db to be of type *gorm.DB")
}
