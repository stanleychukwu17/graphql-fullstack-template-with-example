package utils_test

import (
	"testing"

	"github.com/stanleychukwu17/graphql-fullstack-template-with-example/server-golang/utils"
	"github.com/stretchr/testify/require"
)

func TestShow_bad_message(t *testing.T) {
	result := utils.Show_bad_message("test")
	require.Equal(t, "bad", result["msg"])
	require.Equal(t, "test", result["cause"])
}

func TestCheck_if_required_fields_are_present(t *testing.T) {
	items := []utils.FieldRequirement{
		{Key: "test", Length: 5, Msg: "test message"},
	}

	found_error, error_msg := utils.Check_if_required_fields_are_present(items)

	require.True(t, found_error)
	require.Equal(t, "test message", error_msg)
}
