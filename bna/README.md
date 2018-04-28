# BNA

## Configuración createPeerAdminCard.sh
```
    "orderers": {
        "orderer.example.com": {
            "url": "grpc://orderer.example.com:7050"
        }
    },
    "peers": {
        "peer0.org1.example.com": {
            "url": "grpc://peer0.org1.example.com:7051",
            "eventUrl": "grpc://peer0.org1.example.com:7053"
        }
    },
    "certificateAuthorities": {
        "ca.org1.example.com": {
            "url": "http://ca.org1.example.com:7054",
            "caName": "ca.org1.example.com"
        }
    }
```

## Configuración composer-rest-server -> rest-server/envvars.txt
```
export COMPOSER_PORT=3000
export COMPOSER_CARD=admin@peixeencadeado
export COMPOSER_NAMESPACES=always
export COMPOSER_WEBSOCKETS=true
export COMPOSER_TLS=false
export COMPOSER_AUTHENTICATION=false
export COMPOSER_MULTIUSER=false
export COMPOSER_PROVIDERS='{
    "google": {
        "provider": "google",
        "module": "passport-google-oauth2",
        "clientID": "CLIENT-ID",
        "clientSecret": "CLIENT-SECRET",
        "authPath": "/auth/google",
        "callbackURL": "/auth/google/callback",
        "scope": "https://www.googleapis.com/auth/plus.login",
        "successRedirect": "/",
        "failureRedirect": "/"
    }
}'
export COMPOSER_DATASOURCES='{
    "db": {
        "name": "db",
        "connector": "mongodb",
        "host": "mongo"
    }
}'
```
