#!/bin/bash
docker rm -f $(docker ps -aq)
docker rmi $(docker images dev-* -q)
set -e
export FABRIC_START_TIMEOUT=15
FABRIC_VERSION=hlfv11
fabric-tools/startFabric.sh
docker build -t composer-dev .
docker run -d --name composer-dev \
    -v ~/.composer:/root/.composer \
    -v $PWD:/root/bna \
    -p 8080:8080 --network composer_default composer-dev

until [ $(docker logs composer-dev --tail 50 2>&1 | grep 'composer-dev iniciado' | wc -l) -gt 0 ]; do
    sleep 10;
    docker logs composer-dev --tail 10
done

cd rest-server && ./runServer.sh
