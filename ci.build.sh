#!/bin/bash
# This script can be used to manually build the docker images necessary to run the tests
# It should be executed from the tests folder

echo " ci.build.sh == Build test image"

BASEDIR=$(dirname $(readlink -f $0))

source $BASEDIR/set-env.sh

# It assumes that you previously built the module you're going to be testing
#   and that the modules artifacts are located one level up

if [ ! -d ./artifacts ]; then
  mkdir -p ./artifacts
fi

if [[ -e ../target ]]; then
  cp ../target/*-SNAPSHOT.jar ./artifacts/
fi

if [ -d ./jahia-module ]; then
  cd jahia-module
  if [ -e "pom.xml" ]; then
    mvn clean install
    find . -type f -name "*-SNAPSHOT.jar" -exec cp {} ../artifacts/ \;
  elif [ -e "package.json" ]; then
    rm ./*-SNAPSHOT.tgz
    yarn set version stable && yarn install && yarn build && yarn jahia-pack

    packages=$(ls *.tgz)
    for package in $packages
    do
      filename=$(basename "$package" .tgz)
      new_filename="$filename-SNAPSHOT.tgz"
      mv "$package" "$new_filename"
    done
    cp ./*-SNAPSHOT.tgz ../artifacts/
  fi
  cd ..
fi
YARN_VERSION=${YARN_VERSION:-1.22.19}

# Use Docker buildx with cache if enabled via environment variables
if [ "$DOCKER_BUILD_CACHE_ENABLED" = "true" ]; then
  echo "Docker cache is enabled, building using 'docker buildx build'"
  echo "cache-from: $DOCKER_BUILDX_CACHE_FROM"
  echo "cache-to: $DOCKER_BUILDX_CACHE_TO"
  docker buildx build \
    --cache-from "$DOCKER_BUILDX_CACHE_FROM" \
    --cache-to "$DOCKER_BUILDX_CACHE_TO" \
    --build-arg YARN_VERSION=${YARN_VERSION} \
    -f $BASEDIR/env.Dockerfile \
    -t ${TESTS_IMAGE} \
    --load \
    .
else
  echo "Docker cache is disabled, building using 'docker build'"
  docker build --build-arg YARN_VERSION=${YARN_VERSION} -f $BASEDIR/env.Dockerfile -t ${TESTS_IMAGE} .
fi
