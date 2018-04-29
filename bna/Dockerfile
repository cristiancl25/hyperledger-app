FROM node:8.11.1-wheezy
RUN npm -g config set user root && \
    npm install -g composer-cli composer-playground
WORKDIR /root/bna
CMD /root/bna/composer.sh && composer-playground