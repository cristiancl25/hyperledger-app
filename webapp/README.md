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

# Build de la aplicación y establecimiento de la IP del servidor rest
export REST_SERVER=composer-server.ddns.net:2000
npm run envprod

# Servidor para los perfiles de conexión en el puerto 8080
docker run -d -v ~/.composer:/var/www:ro -p 8080:8080 trinitronx/python-simplehttpserver

# Nginx dockerizado con la aplicación web
docker run --name nginx -d -p 80:80 -p 443:443 -v $PWD/dist:/usr/share/nginx/html -v $PWD/nginx:/etc/nginx/conf.d/ nginx

# Certificado autofirmado
openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out MyCertificate.crt -keyout MyKey.key
```

docker run --name node -v $PWD:/home/node/webapp -it node:8.11.3-jessie /bin/bash

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

docker run -it --rm \
-v $PWD/nginx/certs/etc/letsencrypt:/etc/letsencrypt \
-v $PWD/nginx/certs/var/lib/letsencrypt:/var/lib/letsencrypt \
-v $PWD/dist:/data/letsencrypt \
certbot/certbot \
certonly --webroot \
--register-unsafely-without-email --agree-tos \
--webroot-path=/data/letsencrypt \
--staging \
-d composer-server.ddns.net