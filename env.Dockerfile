FROM cypress/browsers:node-20.11.0-chrome-121.0.6167.85-1-ff-120.0-edge-121.0.2277.83-1

ARG MAVEN_VER="3.8.1"
ARG MAVEN_BASE_URL="https://archive.apache.org/dist/maven/maven-3"

RUN apt-get update && apt-get install -y jq

RUN adduser --disabled-password jahians

USER jahians
WORKDIR /home/jahians

COPY --chown=jahians:jahians package.json yarn.lock /home/jahians/

RUN mkdir -p /home/jahians/run-artifacts /home/jahians/results /home/jahians/cypress/plugins

#CI=true reduces the verbosity of the installation logs
RUN CI=true yarn install --non-interactive

COPY --chown=jahians:jahians . /home/jahians

RUN CI=true /home/jahians/node_modules/.bin/cypress install

RUN mkdir -p .m2; cp maven.settings.xml .m2/settings.xml; exit 0

CMD /bin/bash -c /home/jahians/env.run.sh
