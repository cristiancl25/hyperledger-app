FROM node:8.11.1-wheezy
RUN npm -g config set user root
RUN npm install -g composer-cli composer-playground
COPY dist/peixeencadeado.bna /root
COPY setUpDemo.sh /root
WORKDIR /root
CMD /root/setUpDemo.sh && composer-playground
# docker build -t composer-dev .
# docker run -d --name composer-dev -v ~/.composer:/root/.composer -p 8080:8080 --network composer_default composer-dev