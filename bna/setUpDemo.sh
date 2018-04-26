#!/bin/bash

# Creación dunha pesqueira, o seu administrador e un usuario
composer transaction submit -c admin@peixeencadeado -d '{
    "$class":"org.peixeencadeado.organizacions.CrearOrganizacion",
    "orgId":"pes1",
    "tipoOrganizacion":"PESQUEIRA",
    "descripcion":"Descripción da pesqueira",
    "nomeAdmin":"admin",
    "emailAdmin":"admin@pes1"
}'
composer identity issue -c admin@peixeencadeado -f admin_pes1.card -u admin@pes1 -a "resource:org.peixeencadeado.participantes.OrgAdmin#admin@pes1" -x
composer card import -f admin_pes1.card

composer transaction submit -c admin@pes1@peixeencadeado -d '{
    "$class":"org.peixeencadeado.participantes.CrearParticipanteUsuario",
    "nome":"usuario1",
    "email":"usuario1@pes1"
}'
composer identity issue -c admin@pes1@peixeencadeado -f usuario1_pes1.card -u usuario1@pes1 -a "resource:org.peixeencadeado.participantes.Usuario#usuario1@pes1"
composer card import -f usuario1_pes1.card

composer transaction submit -c usuario1@pes1@peixeencadeado -d '{
  "$class": "org.peixeencadeado.peixe.CrearPeixe",
  "variedade": "XURELO",
  "descripcion": "Descripción do xurelo",
  "peso": 2,
  "latitude": 43,
  "lonxitude":-8 
}'