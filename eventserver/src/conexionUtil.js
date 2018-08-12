'use strict';

 module.exports = {
    cardStore : require('composer-common').FileSystemCardStore,
    BusinessNetworkConnection : require('composer-client').BusinessNetworkConnection,
    connection: {},
    connect : async function(main) {
        const { CARD } = require('./card');
        var cardType = { type: 'composer-wallet-filesystem' }
        this.connection = new this.BusinessNetworkConnection(cardType);
        try {
            await this.connection.connect(CARD);
            await main();
        } catch (error) {
            await main(error);
        }
    },
    disconnect : function() {
        this.connection.disconnect();
    },
    ping : async function(){
        return await this.connection.ping();
    }
 }