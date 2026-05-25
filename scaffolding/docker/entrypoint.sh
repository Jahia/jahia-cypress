#!/bin/bash
set -e
source set-env.sh

# Display various system details for debugging purposes
echo "$(date +'%d %B %Y - %k:%M') == entrypoint.sh == Printing system details"
echo "$(date +'%d %B %Y - %k:%M') Yarn version: $(yarn --version)"
echo "$(date +'%d %B %Y - %k:%M') Node version: $(node --version)"
echo "$(date +'%d %B %Y - %k:%M') Jahia CLI version: $(jahia-cli --version)"
echo "$(date +'%d %B %Y - %k:%M') "

# Provision the environment
# This will execute a set of steps defined in a "provision" workflow named
echo "$(date +'%d %B %Y - %k:%M') == entrypoint.sh == Executing Jahia CLI provision workflow =="
jahia-cli workflow:run -c ${JAHIACLI_CONFIG} --name provision --debug=${J_TESTS_DEBUG}

# Before running the tests, make sure there are no errors in the logs
# In Server Availability Manager (SAM), a probe with LOW severity called JahiaErrorsProbe checks for errors in the logs.
# Using it we can ensure there were no errors during the provisioning phase and that the environment is in a healthy state before running the tests.
# If there are errors, print the logs and exit with failure to avoid running tests in a broken environment
jahia-cli jahia:alive --timeout 300 --severity LOW --url ${JAHIA_URL}
if [[ $? -ne 0 ]]; then
  echo "$(date +'%d %B %Y - %k:%M') == Errors detected in logs before running tests =="
  echo "Printing the last 100 lines of the Jahia logs for debugging purposes:"
  jahia-cli environment:logs --component jahia --tail 200
else
  echo "$(date +'%d %B %Y - %k:%M') == No errors detected in the Jahia logs, proceeding with tests =="
fi

# Run the tests
echo "$(date +'%d %B %Y - %k:%M') == Starting Cypress tests with mode: ${CYPRESS_MODE} and configuration file: ${CYPRESS_CONFIGURATION_FILE} =="
NO_COLOR=1 yarn e2e:${CYPRESS_MODE} --config-file "${CYPRESS_CONFIGURATION_FILE}"
if [[ $? -eq 0 ]]; then
  echo "$(date +'%d %B %Y - %k:%M') == Full execution successful =="
  echo "success" > ./results/test_success
  yarn report:merge; yarn report:html
else
  echo "$(date +'%d %B %Y - %k:%M') == One or more failed tests =="
  echo "failure" > ./results/test_failure
  yarn report:merge; yarn report:html
fi

# Setting up the DEBUG flag
# This flags keeps the environment running after tests have been running and until reaching the CI/CD timeout
if [[ "${DEBUG}" == "true" ]]; then
  touch /tmp/debug
fi
WAIT_DURATION=0
while [[ -e /tmp/debug ]]; do
  echo "Debug file present - $(( ++ WAIT_DURATION ))s - waiting for file removal or expiration of GitHub Actions timeout..."
  sleep 1;
done

if [[ -e ./results/test_success ]]; then
  exit 0
else
  exit 1
fi
