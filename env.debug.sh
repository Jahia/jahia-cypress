#!/bin/bash
# This script can be used to warmup the environment and execute the tests
# It is used by the docker image at startup

BASEDIR=$(dirname $(readlink -f $0))

bash $BASEDIR/env.provision.sh

source $BASEDIR/set-env.sh

if [[ -z "${CYPRESS_CONFIGURATION_FILE}" ]]; then
  CYPRESS_CONFIGURATION_FILE=cypress.config.ts
fi

yarn e2e:debug --config-file "${CYPRESS_CONFIGURATION_FILE}"
