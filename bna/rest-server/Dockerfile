FROM hyperledger/composer-rest-server
USER root
RUN npm install --production loopback-connector-mongodb passport-google-oauth2 && \
npm cache clean --force && \
ln -s node_modules .node_modules