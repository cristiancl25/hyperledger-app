#!/bin/bash
docker rm -f $(docker ps -aq)
docker rmi $(docker images dev-* -q)
#docker rmi $(docker images -aq)
#rm -rf fabric-tools
rm -rf ~/.composer
composer archive create --sourceType dir --sourceName ../ -a peixeencadeado.bna
#mkdir fabric-tools
cd fabric-tools
#curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.tar.gz
#tar -xvf fabric-dev-servers.tar.gz
export FABRIC_VERSION=hlfv11
#./downloadFabric.sh
./startFabric.sh
./createPeerAdminCard.sh
composer network install --card PeerAdmin@hlfv1 --archiveFile ../peixeencadeado.bna
composer network start --networkName peixeencadeado --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
composer card import --file networkadmin.card

# Executar transacción
composer transaction submit -c admin@peixeencadeado -d '{
     "$class":"org.peixeencadeado.peixe.SetupDemo"
 }'

# # Engadir participante
# # composer participant add -c admin@peixeencadeado -d '{
# #     "$class": "org.peixeencadeado.participantes.Usuario",
# #     "email": "participante1@org1",
# #     "nome": "participante1",
# #     "orgId": "org1"
# #   }'

composer identity issue -c admin@peixeencadeado -f usuario.card -u participante1@org1 -a "resource:org.peixeencadeado.participantes.Usuario#participante1@org1"
composer card import -f usuario.card

# composer-rest-server
# export COMPOSER_PORT=3001
# export COMPOSER_CARD=admin@peixeencadeado
# export COMPOSER_NAMESPACES=always
# export COMPOSER_WEBSOCKETS=true
# export COMPOSER_TLS=false
# export COMPOSER_AUTHENTICATION=false
# export COMPOSER_MULTIUSER=false
# composer-rest-server

# composer-rest-server + Autenticación + Multiusuario + mongodb
docker run -d --name mongo --network composer_default -p 27017:27017 mongo
source ../envvars.txt
composer-rest-server

# sed -e 's/localhost:/orderer.example.com:/' -e 's/localhost:/peer0.org1.example.com:/' -e 's/localhost:/peer0.org1.example.com:/' -e 's/localhost:/ca.org1.example.com:/'  < $HOME/.composer/cards/admin@peixeencadeado/connection.json  > /tmp/connection.json && cp -p /tmp/connection.json $HOME/.composer/cards/admin@peixeencadeado
# docker run \
# -d \
# -e COMPOSER_CARD=${COMPOSER_CARD} \
# -e COMPOSER_NAMESPACES=${COMPOSER_NAMESPACES} \
# -e COMPOSER_AUTHENTICATION=${COMPOSER_AUTHENTICATION} \
# -e COMPOSER_MULTIUSER=${COMPOSER_MULTIUSER} \
# -e COMPOSER_PROVIDERS="${COMPOSER_PROVIDERS}" \
# -e COMPOSER_DATASOURCES="${COMPOSER_DATASOURCES}" \
# -v ~/.composer:/home/composer/.composer \
# --name rest \
# --network composer_default \
# -p 3000:3000 \
# -p 8080:8080 \
# hyperledger-rest-server