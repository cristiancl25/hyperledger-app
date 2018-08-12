const util = require('./conexionUtil');
util.connect(main);

async function main(error){

    if(error){
        console.log(error);
        process.exit(1);
    }

    var respuesta = await util.ping();
    console.log(respuesta);

    util.connection.on('event', async function (event){
        if (event.$type === 'ProductoEnVenta'){
            console.log(event);
            if (event.orgOrigen === 'pes1' && event.tipoProducto === 'Pescado') {

                var factory = util.connection.getBusinessNetwork().getFactory();
                const transaction = factory.newTransaction('org.hyperledger.composer.productos', 'ComprarProducto');
                transaction.productoId = event.productoId;
                await util.connection.submitTransaction(transaction);
                console.log('PRODUCTO COMPRADO');
                
                util.disconnect();
            }
            
        }
    });
}