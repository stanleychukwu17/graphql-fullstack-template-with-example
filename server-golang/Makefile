# crash course
# Without @: By default, make prints each command to the terminal before executing it.
# With @: The @ suppresses the command from being printed, so only the output of the command is shown.

all: hello print

# Target to print "Hello, World!"
hello:
	echo "Hello, World!"

# Target to print a custom message
print:
	@echo "This is a custom message."

go-test:
	export ENV=development && \
	export BG_USER="development" && \
	go test ./...

go-test-ci:
	@export ENV=continuous_integration && \
	go run github.com/joho/godotenv/cmd/godotenv -f .env.ci -- go test ./...

go-test-report:
	@export ENV=development && \
	echo $$ENV && \
	go test -coverprofile=coverage.out ./... && \
	go tool cover -html=coverage.out -o coverage.html && \
	go tool cover -func=coverage.out

# Declare phony targets
.PHONY: hello print date list