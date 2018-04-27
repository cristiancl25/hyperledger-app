#!/bin/bash
set -e
# MODIFICAR createPeerAdminCard.sh cos datos do README.md antes de executar
./fabric-tools/createPeerAdminCard.sh
npm run prepublish
composer network install --card PeerAdmin@hlfv1 --archiveFile dist/peixeencadeado.bna
composer network start --networkName peixeencadeado --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file ~/.composer/networkadmin.card
composer card import --file ~/.composer/networkadmin.card
# Creación dunha pesqueira, o seu administrador e un usuario
composer transaction submit -c admin@peixeencadeado -d '{
    "$class":"org.peixeencadeado.organizacions.CrearOrganizacion",
    "orgId":"pes1",
    "tipoOrganizacion":"PESQUEIRA",
    "descripcion":"Descripción da pesqueira",
    "nomeAdmin":"admin",
    "emailAdmin":"admin@pes1"
}'
composer identity issue -c admin@peixeencadeado -f ~/.composer/admin_pes1.card -u admin@pes1 -a "resource:org.peixeencadeado.participantes.OrgAdmin#admin@pes1" -x
composer card import -f ~/.composer/admin_pes1.card

composer transaction submit -c admin@pes1@peixeencadeado -d '{
    "$class":"org.peixeencadeado.participantes.CrearParticipanteUsuario",
    "nome":"usuario1",
    "email":"usuario1@pes1"
}'
composer identity issue -c admin@pes1@peixeencadeado -f ~/.composer/usuario1_pes1.card -u usuario1@pes1 -a "resource:org.peixeencadeado.participantes.Usuario#usuario1@pes1"
composer card import -f ~/.composer/usuario1_pes1.card

composer transaction submit -c usuario1@pes1@peixeencadeado -d '{
  "$class": "org.peixeencadeado.peixe.CrearPeixe",
  "variedade": "XURELO",
  "descripcion": "Descripción do xurelo",
  "peso": 2,
  "latitude": 43,
  "lonxitude":-8 
}'
