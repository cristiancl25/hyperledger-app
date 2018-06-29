#!/bin/bash
set -e
docker run -d --name mongo --network composer_default -p 27017:27017 mongo
docker build -t composer-rest-server .
docker run \
-d \
-e COMPOSER_PORT=3000 \
-e COMPOSER_CARD=admin@bna \
-e COMPOSER_NAMESPACES=always \
-e COMPOSER_WEBSOCKETS=true \
-e COMPOSER_TLS=false \
-e COMPOSER_TLS_CERTIFICATE=/etc/letsencrypt/live/composer-server.ddns.net/fullchain.pem \
-e COMPOSER_TLS_KEY=/etc/letsencrypt/live/composer-server.ddns.net/privkey.pem \
-e COMPOSER_AUTHENTICATION=false \
-e COMPOSER_MULTIUSER=false \
-e COMPOSER_PROVIDERS='{
    "google": {
        "provider": "google",
        "module": "passport-google-oauth2",
        "clientID": "CLIENT-ID",
        "clientSecret": "CLIENT-SECRET",
        "authPath": "/auth/google",
        "callbackURL": "/auth/google/callback",
        "scope": "https://www.googleapis.com/auth/plus.login",
        "successRedirect": "https://composer-server.ddns.net",
        "failureRedirect": "https://composer-server.ddns.net"
    }
}' \
-e COMPOSER_DATASOURCES='{
    "db": {
        "name": "db",
        "connector": "mongodb",
        "host": "mongo"
    }
}' \
-v ~/.composer:/root/.composer \
-v /etc/letsencrypt/:/etc/letsencrypt/ \
--name rest \
--network composer_default \
-p 3000:3000 \
composer-rest-server