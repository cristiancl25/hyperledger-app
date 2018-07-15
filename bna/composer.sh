#!/bin/bash
set -e
rm -rf ~/.composer/*
cd fabric-tools && ./createPeerAdminCard.sh && cd ..

if [ ! -d "./node_modules" ]; then
  npm install
fi

npm run prepublish
mkdir ~/.composer/profiles
composer network install --card PeerAdmin@hlfv1 --archiveFile dist/bna.bna
composer network start --networkName bna --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file ~/.composer/profiles/networkadmin.card
composer card import --file ~/.composer/profiles/networkadmin.card

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
    "nombre":"pes1",
    "idAdmin":"admin@pes1",
    "tipoOrganizacion":"PESQUEIRA",
    "descripcion":"Descripción da pesqueira",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@pes1"
}'
composer identity issue -c admin@bna -f ~/.composer/profiles/admin_pes1.card -u admin@pes1 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@pes1" -x
# composer card import -f ~/.composer/profiles/admin_pes1.card

# # Creación de un usuario para una organización
# composer transaction submit -c admin@pes1@bna -d '{
#     "$class":"org.hyperledger.composer.participantes.CrearParticipante",
#     "id":"usuario1@pes1",
#     "nombre":"usuario1",
#     "email":"usuario1@pes1",
#     "tipoUsuario":"Usuario"
# }'
# composer identity issue -c admin@pes1@bna -f ~/.composer/profiles/usuario1_pes1.card -u usuario1@pes1 -a "resource:org.hyperledger.composer.participantes.Usuario#usuario1@pes1"
# composer card import -f ~/.composer/profiles/usuario1_pes1.card

# Creación de una organización y su administrador
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearOrganizacion",
    "orgId":"res1",
    "nombre":"res1",
    "idAdmin":"admin@res1",
    "tipoOrganizacion":"RESTAURANTE",
    "descripcion":"Descripción del restaurante",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@res1"
}'
composer identity issue -c admin@bna -f ~/.composer/profiles/admin_res1.card -u admin@res1 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@res1" -x
# composer card import -f ~/.composer/profiles/admin_res1.card

# Creación de una organización y su administrador
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearOrganizacion",
    "orgId":"org1",
    "nombre":"org1",
    "idAdmin":"admin@org1",
    "tipoOrganizacion":"RESTAURANTE",
    "descripcion":"Descripción del restaurante",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@org1"
}'
composer identity issue -c admin@bna -f ~/.composer/profiles/admin_org1.card -u admin@org1 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@org1" -x

# Creación de una organización y su administrador
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearOrganizacion",
    "orgId":"org2",
    "nombre":"org2",
    "idAdmin":"admin@org2",
    "tipoOrganizacion":"RESTAURANTE",
    "descripcion":"Descripción del restaurante",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@org2"
}'
composer identity issue -c admin@bna -f ~/.composer/profiles/admin_org2.card -u admin@org2 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@org2" -x

# Creación de una organización y su administrador
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearOrganizacion",
    "orgId":"org3",
    "nombre":"org3",
    "idAdmin":"admin@org3",
    "tipoOrganizacion":"PESQUEIRA",
    "descripcion":"Descripción del restaurante",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@org3"
}'
composer identity issue -c admin@bna -f ~/.composer/profiles/admin_org3.card -u admin@org3 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@org3" -x

# Creación de una organización y su administrador
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearOrganizacion",
    "orgId":"org4",
    "nombre":"org4",
    "idAdmin":"admin@org4",
    "tipoOrganizacion":"PESQUEIRA",
    "descripcion":"Descripción del restaurante",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@org4"
}'
composer identity issue -c admin@bna -f ~/.composer/profiles/admin_org4.card -u admin@org4 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@org4" -x

# Creación de una organización y su administrador
composer transaction submit -c admin@bna -d '{
    "$class":"org.hyperledger.composer.organizaciones.CrearOrganizacion",
    "orgId":"org5",
    "nombre":"org5",
    "idAdmin":"admin@org5",
    "tipoOrganizacion":"PESQUEIRA",
    "descripcion":"Descripción del restaurante",
    "nombreAdmin":"admin",
    "emailAdmin":"admin@org5"
}'
composer identity issue -c admin@bna -f ~/.composer/profiles/admin_org5.card -u admin@org5 -a "resource:org.hyperledger.composer.participantes.OrgAdmin#admin@org5" -x

# # Creación de un usuario dentro de una organizacion
# composer transaction submit -c admin@res1@bna -d '{
#     "$class":"org.hyperledger.composer.participantes.CrearParticipante",
#     "id":"usuario1@res1",
#     "nombre":"usuario1",
#     "email":"usuario1@res1",
#     "tipoUsuario":"Usuario"
# }'
# composer identity issue -c admin@res1@bna -f ~/.composer/profiles/usuario1_res1.card -u usuario1@res1 -a "resource:org.hyperledger.composer.participantes.Usuario#usuario1@res1"
# composer card import -f ~/.composer/usuario1_res1.card

# # composer transaction submit -c usuario1@pes1@bna -d '{
#   "$class": "org.hyperledger.composer.productos.CrearTipoProducto",
#   "tipo": "Pescado"
# }'

# # composer transaction submit -c usuario1@pes1@bna -d '{
#   "$class": "org.hyperledger.composer.productos.CrearProducto",
#   "identificador": "id1",
#   "caracteristicas": {
#     "$class": "org.hyperledger.composer.productos.Caracteristicas",
#     "tipoProducto": "resource:org.hyperledger.composer.productos.TipoProducto#Pescado",
#     "tipo": "UNIDAD",
#     "variedadProducto": "variedad1",
#     "descripcion" : "descripcion del producto",
#     "unidades" : 1,
#     "peso" : 3.5,
# 	"magnitudPeso" : "kg"    
#   },
#   "loc" : {
#     "$class": "org.hyperledger.composer.productos.Loc",
#     "latitud": 3.14,
#     "longitud": 5.3,
#     "direccion": "direccion1"
#   }
# }'
echo composer-dev iniciado