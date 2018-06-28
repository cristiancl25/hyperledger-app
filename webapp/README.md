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

# Run webapp in a nginx server
docker rm -f nginx && docker run --name nginx -d -p 80:80 -p 443:443 -v $PWD/dist:/usr/share/nginx/html -v $PWD/nginx:/etc/nginx/conf.d/ nginx

# Certificado autofirmado
openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out MyCertificate.crt -keyout MyKey.key
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
