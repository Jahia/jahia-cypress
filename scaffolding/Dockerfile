FROM cypress/browsers:node-24.15.0-chrome-148.0.7778.96-1-ff-150.0.3-edge-148.0.3967.54-1

ARG MAVEN_VER="3.8.1"
ARG MAVEN_BASE_URL="https://archive.apache.org/dist/maven/maven-3"
ARG YARN_VERSION="1.22.19"

RUN apt-get update
RUN apt-get install -y jq curl ; \
    npm -g install corepack ; \
    corepack enable ; \
    npm install -g @jahia/jahia-cli@latest

RUN adduser --disabled-password jahians

USER jahians
WORKDIR /home/jahians

COPY --chown=jahians:jahians package.json yarn.lock /home/jahians/

RUN mkdir -p /home/jahians/run-artifacts /home/jahians/results /home/jahians/cypress/plugins

#CI=true reduces the verbosity of the installation logs
RUN CI=true yarn set version ${YARN_VERSION} ;

COPY --chown=jahians:jahians . /home/jahians

RUN CI=true yarn install ; \
    /home/jahians/node_modules/.bin/cypress install

