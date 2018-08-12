#!/bin/bash
set -e 
docker rm -f eventserver
docker build -t eventserver .
docker run -d --name eventserver -v ~/.composer:/root/.composer -v $PWD:/root/eventserver --network composer_default eventserver