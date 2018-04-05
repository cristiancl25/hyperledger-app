#!/bin/sh
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images -aq)
rm -rf fabric-tools
rm -rf ~/.composer
mkdir fabric-tools && cd fabric-tools
curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz
tar -xvf fabric-dev-servers.tar.gz
export FABRIC_VERSION=hlfv11
./downloadFabric.sh
./startFabric.sh
./createPeerAdminCard.sh
composer network install --card PeerAdmin@hlfv1 --archiveFile ../peixeencadeado.bna
composer network start --networkName peixeencadeado --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
composer card import --file networkadmin.card