package database_test

import (
	"testing"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/database"
	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/test"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func TestConnect_to_continuous_integration_database(t *testing.T) {
	test.BeforeEach(t)

	postgres_db, err := database.Connect_to_continuous_integration_database("postgres")
	require.NoError(t, err, "Expected no error while connecting to the database")
	require.IsType(t, &gorm.DB{}, postgres_db, "Expected db to be of type *gorm.DB")

	mysql_db, err := database.Connect_to_continuous_integration_database("mysql")
	require.NoError(t, err, "Expected no error while connecting to the database")
	require.IsType(t, &gorm.DB{}, mysql_db, "Expected db to be of type *gorm.DB")
}

// i commented the test below out because, the default db for this template app is always mysql
// when i start up my docker engine, only the mysql container is started automatically, so this test will always return an error
// except you also start the postgres container and re-run the test
// func TestNewConnection(t *testing.T) {
// 	test.BeforeEach(t)

// 	postgres_db, err := database.NewConnection("postgres")
// 	require.NoError(t, err, "Expected no error while connecting to the postgres database")
// 	require.IsType(t, &gorm.DB{}, postgres_db, "Expected db to be of type *gorm.DB")
// }
