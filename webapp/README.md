# vue-test

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# Contenedor docker con node y npm 
docker run --name node -v $PWD:/home/node/webapp -it node:8.11.3-jessie /bin/bash

# Build de la aplicación y establecimiento de la IP del servidor rest
npm install
export REST_SERVER=https://IP
export WS_SERVER=ws://IP
npm run envprod

# Servidor para los perfiles de conexión en el puerto 9090
docker run -d -v ~/.composer:/var/www:ro -p 9090:8080 trinitronx/python-simplehttpserver

# Nginx dockerizado con la aplicación web
docker run --name nginx -d -p 80:80 -p 443:443 -v $PWD/dist:/usr/share/nginx/html -v $PWD/nginx:/etc/nginx/conf.d/ -v /etc/letsencrypt:/etc/letsencrypt nginx

# Certificado autofirmado
openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out MyCertificate.crt -keyout MyKey.key

# Certificado con letsEncrypt
docker run -it --rm \
-v $PWD/certs/:/etc/letsencrypt \
-v $PWD/dist:/data/letsencrypt \
certbot/certbot \
certonly --webroot \
--email EMAIL --agree-tos --no-eff-email \
--webroot-path=/data/letsencrypt \
-d DOMINIO-http://example.com


