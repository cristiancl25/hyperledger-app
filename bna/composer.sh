#!/bin/bash
set -e
rm -rf ~/.composer/*
cd fabric-tools && ./createPeerAdminCard.sh && cd ..

if [ ! -d "./node_modules" ]; then
  npm install
fi

npm run prepublish

composer network install --card PeerAdmin@hlfv1 --archiveFile dist/bna.bna
composer network start --networkName bna --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file ~/.composer/networkadmin.card
composer card import --file ~/.composer/networkadmin.card

# Creación de un nuevo tipo de organización
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearTipoOrganizacion",
    "tipo":"PESQUEIRA"
}'

# Creación de un nuevo tipo de organización
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearTipoOrganizacion",
    "tipo":"RESTAURANTE"
}'

# Creación de una organización y su administrador
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearOrganizacion",
    "orgId":"pes1",
    "tipoOrganizacion":"PESQUEIRA",
    "descripcion":"Descripción da pesqueira",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@pes1"
}'
composer identity issue -c admin@bna -f ~/.composer/admin_pes1.card -u admin@pes1 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@pes1" -x
composer card import -f ~/.composer/admin_pes1.card

# Creación de un usuario para una organización
composer transaction submit -c admin@pes1@bna -d '{
    "$class":"org.hyperledger.composer.participantes.CrearParticipante",
    "nombre":"usuario1",
    "email":"usuario1@pes1",
    "tipoUsuario":"Usuario"
}'
composer identity issue -c admin@pes1@bna -f ~/.composer/usuario1_pes1.card -u usuario1@pes1 -a "resource:org.hyperledger.composer.participantes.Usuario#usuario1@pes1"
composer card import -f ~/.composer/usuario1_pes1.card

# Creación de una organización y su administrador
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearOrganizacion",
    "orgId":"res1",
    "tipoOrganizacion":"RESTAURANTE",
    "descripcion":"Descripción del restaurante",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@res1"
}'
composer identity issue -c admin@bna -f ~/.composer/admin_res1.card -u admin@res1 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@res1" -x
composer card import -f ~/.composer/admin_res1.card

# Creación de un usuario dentro de una organizacion
composer transaction submit -c admin@res1@bna -d '{
    "$class":"org.hyperledger.composer.participantes.CrearParticipante",
    "nombre":"usuario1",
    "email":"usuario1@res1",
    "tipoUsuario":"Usuario"
}'
composer identity issue -c admin@res1@bna -f ~/.composer/usuario1_res1.card -u usuario1@res1 -a "resource:org.hyperledger.composer.participantes.Usuario#usuario1@res1"
#composer card import -f ~/.composer/usuario1_res1.card

composer transaction submit -c usuario1@pes1@bna -d '{
  "$class": "org.hyperledger.composer.productos.CrearTipoProducto",
  "tipo": "Pescado"
}'

composer transaction submit -c usuario1@pes1@bna -d '{
  "$class": "org.hyperledger.composer.productos.CrearProducto",
  "identificador": "id1",
  "caracteristicas": {
    "$class": "org.hyperledger.composer.productos.Caracteristicas",
    "tipoProducto": "resource:org.hyperledger.composer.productos.TipoProducto#Pescado",
    "tipo": "UNIDAD",
    "variedadProducto": "variedad1",
    "descripcion" : "descripcion del producto",
    "unidades" : 1,
    "peso" : 3.5,
	"magnitudPeso" : "kg"    
  },
  "loc" : {
    "$class": "org.hyperledger.composer.productos.Loc",
    "latitud": 3.14,
    "longitud": 5.3,
    "direccion": "direccion1"
  }
}'
echo composer-dev iniciado