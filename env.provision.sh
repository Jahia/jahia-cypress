#!/bin/bash
# This script can be used to warmup the environment and execute the tests
# It is used by the docker image at startup

BASEDIR=$(dirname $(readlink -f $0))

source $BASEDIR/set-env.sh

#!/usr/bin/env bash
START_TIME=$SECONDS

echo "$(date +'%d %B %Y - %k:%M') == Printing the most important environment variables"
echo " MANIFEST: ${MANIFEST}"
echo " NEXUS_USERNAME: ${NEXUS_USERNAME:0:3}***${NEXUS_USERNAME:(-6)}"
echo " TESTS_IMAGE: ${TESTS_IMAGE}"
echo " JAHIA_IMAGE: ${JAHIA_IMAGE}"
echo " JAHIA_CLUSTER_ENABLED: ${JAHIA_CLUSTER_ENABLED}"
echo " MODULE_ID: ${MODULE_ID}"
echo " JAHIA_URL: ${JAHIA_URL}"
echo " JAHIA_HOST: ${JAHIA_HOST}"
echo " JAHIA_PORT: ${JAHIA_PORT}"
echo " JAHIA_USERNAME: ${JAHIA_USERNAME}"
echo " JAHIA_PASSWORD: ${JAHIA_PASSWORD}"
echo " JAHIA_USERNAME_TOOLS: ${JAHIA_USERNAME_TOOLS}"
echo " JAHIA_PASSWORD_TOOLS: ${JAHIA_PASSWORD_TOOLS}"
echo " SUPER_USER_PASSWORD: ${SUPER_USER_PASSWORD}"
echo " TIMEZONE: ${TIMEZONE}"
echo "$(date +'%d %B %Y - %k:%M') ==  Using Node version: $(node -v)"
echo "$(date +'%d %B %Y - %k:%M') ==  Using yarn version: $(yarn -v)"

echo "$(date +'%d %B %Y - %k:%M') ==  Waiting for Jahia to startup"

while [[ $(curl -s -o /dev/null -w ''%{http_code}'' ${JAHIA_URL}/cms/login) -ne 200 ]];
do
  echo "$(date +'%d %B %Y - %k:%M') == Jahia is not available at ${JAHIA_URL}/cms/login, will try in 5 seconds"
  ELAPSED_TIME=$(($SECONDS - $START_TIME))
  if [[ ELAPSED_TIME -gt 300 ]]; then
    echo "$(date +'%d %B %Y - %k:%M') == Exiting, Jahia failed to start after 300 seconds"
    exit 1
  fi
  sleep 5;
done

ELAPSED_TIME=$(($SECONDS - $START_TIME))
echo "$(date +'%d %B %Y - %k:%M') == Jahia became alive in ${ELAPSED_TIME} seconds"

mkdir -p ./run-artifacts
mkdir -p ./results

# Copy manifest file
# If the file doesn't exist, we assume it is a URL and we download it locally
if [[ -e ${MANIFEST} ]]; then
  cp ${MANIFEST} ./run-artifacts
else
  echo "$(date +'%d %B %Y - %k:%M') == Downloading: ${MANIFEST}"
  curl ${MANIFEST} --output ./run-artifacts/curl-manifest
  MANIFEST="curl-manifest"
fi
sed -i -e "s/NEXUS_USERNAME/$(echo ${NEXUS_USERNAME} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')/g" ./run-artifacts/${MANIFEST}
sed -i -e "s/NEXUS_PASSWORD/$(echo ${NEXUS_PASSWORD} | sed -e 's/\\/\\\\/g; s/\//\\\//g; s/&/\\\&/g')/g" ./run-artifacts/${MANIFEST}

echo "$(date +'%d %B %Y - %k:%M') == Executing manifest: ${MANIFEST} =="
curl -u root:${SUPER_USER_PASSWORD} -X POST ${JAHIA_URL}/modules/api/provisioning --form script="@./run-artifacts/${MANIFEST};type=text/yaml" $(find assets -type f | sed -E 's/^(.+)$/--form file=\"@\1\"/' | xargs)
echo
if [[ $? -eq 1 ]]; then
  echo "$(date +'%d %B %Y - %k:%M') == PROVISIONING FAILURE - EXITING SCRIPT, NOT RUNNING THE TESTS"
  echo "failure" > ./results/test_failure
  exit 1
fi

if [[ -d artifacts/ ]]; then
  cd artifacts/
  echo "$(date +'%d %B %Y - %k:%M') == Content of the artifacts/ folder"
  ls -lah
  echo "$(date +'%d %B %Y - %k:%M') [MODULE_INSTALL] == Will start submitting files"
  for file in $(ls -1 *-SNAPSHOT.jar | sort -n)
  do
    echo "$(date +'%d %B %Y - %k:%M') [MODULE_INSTALL] == Submitting module from: $file =="
    curl -u root:${SUPER_USER_PASSWORD} -X POST ${JAHIA_URL}/modules/api/provisioning --form script='[{"installAndStartBundle":"'"$file"'", "forceUpdate":true}]' --form file=@$file
    echo
    echo "$(date +'%d %B %Y - %k:%M') [MODULE_INSTALL] == Module submitted =="
  done

  # This is done after classic .jar module to ensure NPM modules are installed after engine module
  for file in $(ls -1 *-SNAPSHOT.tgz | sort -n)
    do
      echo "$(date +'%d %B %Y - %k:%M') [MODULE_INSTALL] == Submitting NPM module from: $file =="
      curl -u root:${SUPER_USER_PASSWORD} -X POST ${JAHIA_URL}/modules/api/provisioning --form script='[{"installAndStartBundle":"'"$file"'", "forceUpdate":true}]' --form file=@$file
      echo
      echo "$(date +'%d %B %Y - %k:%M') [MODULE_INSTALL] == NPM Module submitted =="
    done
  cd ..
fi

if [[ -d scripts/ ]]; then
  cd ./scripts
  for file in $(ls -1 script-* | sort -n)
  do
    echo "$(date +'%d %B %Y - %k:%M') [SCRIPT] == Submitting script: $file =="
    curl -u root:${SUPER_USER_PASSWORD} -X POST ${JAHIA_URL}/modules/api/provisioning --form script='[{"executeScript":"'"$file"'"}]' --form file=@$file
    echo "$(date +'%d %B %Y - %k:%M') [SCRIPT] == Script executed =="
  done
  cd ..
fi
