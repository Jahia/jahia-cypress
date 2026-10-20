#!/bin/bash
# Checks, once env.provision.sh ran, that the platform holds every module the manifest installs, in
# the state the manifest asks for. The provisioning API answers 200 whatever happened to each
# operation, so a module the Maven repository could not serve only shows as an ERROR line in the log
# of Jahia, and the suite would run on a platform that misses it. env.run.sh stops before Cypress
# starts when this script exits with a non-zero code.

BASEDIR=$(dirname $(readlink -f $0))

source $BASEDIR/set-env.sh

if [[ "${PROVISIONING_CHECK}" == "false" ]]; then
  echo "$(date +'%d %B %Y - %k:%M') [READINESS] == PROVISIONING_CHECK is false, the modules of the manifest are not checked =="
  exit 0
fi

if [[ -z "$JAHIA_PROCESSING_URL" ]]; then
  export JAHIA_PROCESSING_URL="$JAHIA_URL"
fi

# env.provision.sh submits a local manifest as it is, and downloads a remote one into run-artifacts
if [[ -e "${MANIFEST}" ]]; then
  MANIFEST_FILE="${MANIFEST}"
else
  MANIFEST_FILE="./run-artifacts/curl-manifest"
fi
if [[ ! -e "${MANIFEST_FILE}" ]]; then
  echo "$(date +'%d %B %Y - %k:%M') [READINESS] == No manifest at ${MANIFEST_FILE}, nothing to check =="
  exit 0
fi

echo "$(date +'%d %B %Y - %k:%M') [READINESS] == Checking the modules of ${MANIFEST_FILE} on ${JAHIA_PROCESSING_URL} =="
node "$BASEDIR/dist/cli/provisioningCheck.js" \
  --manifest "${MANIFEST_FILE}" \
  --url "${JAHIA_PROCESSING_URL}" \
  --password "${SUPER_USER_PASSWORD}" \
  --ignore "${PROVISIONING_CHECK_IGNORE}" \
  --timeout "${PROVISIONING_CHECK_TIMEOUT:-60}"
