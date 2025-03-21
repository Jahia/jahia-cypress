#!/usr/bin/env bash

# This script controls the startup of the container environment
# It can be used as an alternative to having docker-compose up started by the CI environment

BASEDIR=$(dirname $(readlink -f $0))

source $BASEDIR/set-env.sh

echo " ci.startup.sh == Printing the most important environment variables"
echo " MANIFEST: ${MANIFEST}"
echo " TESTS_IMAGE: ${TESTS_IMAGE}"
echo " JAHIA_IMAGE: ${JAHIA_IMAGE}"
echo " JAHIA_CLUSTER_ENABLED: ${JAHIA_CLUSTER_ENABLED}"
echo " NEXUS_USERNAME: ${NEXUS_USERNAME:0:3}***${NEXUS_USERNAME:(-6)}"

echo "$(date +'%d %B %Y - %k:%M') [LICENSE] == Check if license exists in env variable (JAHIA_LICENSE) =="
if [[ -z ${JAHIA_LICENSE} ]]; then
    echo "$(date +'%d %B %Y - %k:%M') [LICENSE] == Jahia license does not exist, checking if there is a license file in /tmp/license.xml =="
    if [[ -f /tmp/license.xml ]]; then
        echo "$(date +'%d %B %Y - %k:%M') [LICENSE] ==  License found in /tmp/license.xml, base64ing it"
        export JAHIA_LICENSE=$(base64 -i /tmp/license.xml)
    else
        echo "$(date +'%d %B %Y - %k:%M') [LICENSE]  == STARTUP FAILURE, unable to find license =="
        exit 1
    fi
fi

echo "$(date +'%d %B %Y - %k:%M') == Cluster enabled: ${JAHIA_CLUSTER_ENABLED} =="
if [[ "${JAHIA_CLUSTER_ENABLED}" == "true" ||  ${JAHIA_CLUSTER_ENABLED} == true ]]; then
    export CLUSTER_PROFILE="--profile cluster"
fi

echo "$(date +'%d %B %Y - %k:%M') == Starting environment =="
docker-compose ${CLUSTER_PROFILE} up -d --renew-anon-volumes
if [[ "$1" != "notests" ]]; then
    docker ps -a
    docker stats --no-stream
    docker-compose up --abort-on-container-exit cypress
fi
