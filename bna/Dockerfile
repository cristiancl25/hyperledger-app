FROM node:8.11.1-wheezy
RUN npm -g config set user root && \
    npm install -g composer-cli composer-playground
ADD . /root/bna
WORKDIR /root/bna
CMD /root/bna/setUpDemo.sh && composer-playground
# docker build -t composer-dev .
# docker run -d --name composer-dev -v ~/.composer:/root/.composer -p 8080:8080 --network composer_default composer-dev