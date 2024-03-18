FROM cypress/browsers:node-20.10.0-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1

ARG MAVEN_VER="3.8.1"
ARG MAVEN_BASE_URL="https://archive.apache.org/dist/maven/maven-3"
ARG YARN_VERSION="1.22.22"

RUN apt-get update && apt-get install -y jq curl ; \
    adduser --disabled-password jahians ; \
    mkdir -p /home/jahians/run-artifacts /home/jahians/results /home/jahians/cypress/plugins; \
    npm install -g corepack ; \
    corepack enable

USER jahians
WORKDIR /home/jahians

COPY --chown=jahians:jahians . /home/jahians

#CI=true reduces the verbosity of the installation logs
RUN CI=true yarn set version ${YARN_VERSION} ; \
    yarn install; \
    /home/jahians/node_modules/.bin/cypress install

# Exit 0 is used to not fail if the maven.settings.xml file is not present
RUN mkdir -p .m2; cp maven.settings.xml .m2/settings.xml; exit 0    

CMD /bin/bash -c /home/jahians/env.run.sh
