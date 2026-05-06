#!/bin/bash
source ./set-env.sh

docker logs smtp-server > ./artifacts/results/smtp-server.log
