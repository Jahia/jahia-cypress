FROM cypress/browsers:node-22.21.0-chrome-141.0.7390.107-1-ff-144.0-edge-141.0.3537.92-1

ARG MAVEN_VER="3.8.1"
ARG MAVEN_BASE_URL="https://archive.apache.org/dist/maven/maven-3"
ARG YARN_VERSION="1.22.19"

RUN apt-get update && apt-get install -y jq curl ; \
    npm -g install corepack ; \
    corepack enable

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

RUN mkdir -p .m2; cp maven.settings.xml .m2/settings.xml; exit 0

CMD /bin/bash -c /home/jahians/env.run.sh
