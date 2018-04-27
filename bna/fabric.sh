#!/bin/bash
docker rm -f $(docker ps -aq)
docker rmi $(docker images dev-* -q)
#docker rmi $(docker images -aq)
#rm -rf fabric-tools
set -e
rm -rf ~/.composer
#mkdir fabric-tools
cd fabric-tools
#curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz
#tar -xvf fabric-dev-servers.tar.gz
export FABRIC_VERSION=hlfv11
#./downloadFabric.sh
./startFabric.sh
cd ../
docker build -t composer-dev .
docker run -d --name composer-dev \
    -v ~/.composer:/root/.composer \
    -p 8080:8080 --network composer_default composer-dev
cd rest-server && ./runServer.sh
docker logs composer-dev -f
# http://localhost:3000/api/org.peixeencadeado.peixe.Peixe?filter={%22include%22:%22resolve%22}