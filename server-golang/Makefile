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

# Target to print the current date
date:
	@date

ver:
	@go version
	@go version

# Declare phony targets
.PHONY: hello print date list