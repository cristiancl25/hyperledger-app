export const composer = {
    sistema : {
        ping : async function(axios) {
            try{
                let response = await axios.get('/api/system/ping');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getWallet : async function(axios) {
            try{
                let response = await axios.get('/api/wallet/');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        eliminarPerfil : async function(axios, perfil) {
            try{
                let response = await axios.delete('/api/wallet/' + perfil);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
                
            }
        },
        importarPerfil : async function(axios, file) {
            const formData = new FormData()
            formData.append('card', file, file.name)
            try{
                let response = await axios.post('/api/wallet/import?name=' + file.name, formData, {
                  headers : {
                    "Content-Type" : "multipart/form-data"
                  }
                });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
                
            }
        },
        exportarPerfil : async function (axios, id){
            try{
                let response = await axios.get('/api/wallet/' + id + '/export', {
                    responseType : "arraybuffer",
                    headers : {
                        "Accept" : "application/octet-stream"
                    }
                });
                return returnResponse(response);
            }catch(error){
                return {
                    "statusCode" : error.response.status
                };
            }
        },
        setDefault : async function(axios, name) {
            try{
                let response = await axios.post('/api/wallet/' + name + '/setDefault');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        generarIdentidad : async function (axios, participante, id){
            try{
                let response = await axios.post('/api/system/identities/issue',{
                    "participant": participante,
                    "userID": id,
                    "options": {}
                },{
                    responseType : "arraybuffer",
                    headers : {
                        "Accept" : "application/octet-stream"
                    }
                });

                return returnResponse(response);
            }catch(error){
                return {
                    "statusCode" : error.response.status
                };
            }
        },
        revocarIdentidad : async function(axios, id) {
            try{
                let response = await axios.post('/api/system/identities/' + id + '/revoke');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        

    },
    organizaciones : {
        getLocalizacion : async function(axios, loc){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.organizaciones.Localizacion/' + loc);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        eliminarLocalizacion : async function(axios, loc){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.organizaciones.EliminarLocalizacion/', {
                    "$class": "org.hyperledger.composer.organizaciones.EliminarLocalizacion",
                    "localizacionId": loc
                  });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        crearLocalizacion : async function(axios, loc){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.organizaciones.CrearLocalizacion/', loc);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getOrganizacion : async function(axios){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.organizaciones.Organizacion/');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getTipoOrganizacion : async function(axios){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.organizaciones.TipoOrganizacion/');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getOrganizacionId : async function(axios, id){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.organizaciones.Organizacion/' + id + '?filter={%22include%22:%22resolve%22}');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
    },
    participantes : {
        crearParticipante : async function(axios, participante){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.participantes.CrearParticipante', participante);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        eliminarParticipante : async function(axios, id, tipo){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.participantes.EliminarParticipante', {
                    "$class": "org.hyperledger.composer.participantes.EliminarParticipante",
                    "id": id,
                    "tipoUsuario": tipo,
                  });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getParticipante : async function(axios, rol, id){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.participantes.' + rol + '/' + id);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },

    },
    productos : {
        getTipoProducto : async function(axios){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.productos.TipoProducto');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        crearTipoProducto : async function(axios, tipo){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.CrearTipoProducto',{
                    "$class": "org.hyperledger.composer.productos.CrearTipoProducto",
                    "tipo": tipo
                });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getProducto : async function(axios, productoId){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.productos.Producto/' + productoId + '?filter={%22include%22:%22resolve%22}');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getPuja : async function(axios, pujaId){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.productos.Puja/' + pujaId);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        crearProducto : async function(axios, producto){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.CrearProducto/', producto);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        ponerVentaProducto : async function(axios, venta){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.PonerVentaProducto', venta);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        cancelarVenta : async function(axios, productoId){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.CancelarVenta',{
                    "$class": "org.hyperledger.composer.productos.CancelarVenta",
                    "productoId": productoId
                });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        comprarProducto : async function(axios, productoId){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.ComprarProducto', {
                    "$class": "org.hyperledger.composer.productos.ComprarProducto",
                    "productoId": productoId
                });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            } 
        },
        pujarProducto : async function(axios, productoId, precio){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.PujarProducto', {
                    "$class": "org.hyperledger.composer.productos.PujarProducto",
                    "productoId": productoId,
                    "precio": precio
                });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            } 
        },
        finalizarPuja : async function(axios, productoId){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.FinalizarPuja', {
                    "$class": "org.hyperledger.composer.productos.FinalizarPuja",
                    "productoId": productoId
                });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            } 
        },
        getTransacciones : async function(axios){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.productos.Transaccion');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getTransaccionesVenta : async function(axios, org){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.productos.Transaccion?filter={"where": {"orgVenta.orgId": "' + org +'"}}');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        getTransaccionesCompra : async function(axios, org){
            try{
                let response = await axios.get('/api/org.hyperledger.composer.productos.Transaccion?filter={"where": {"orgCompra.orgId": "' + org +'"}}');
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        },
        confirmarTransaccion : async function(axios, datos){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.ConfirmarTransaccion', datos);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            } 
        },
        consumirProducto : async function(axios, productoId){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.ConsumirProducto', {
                    "$class": "org.hyperledger.composer.productos.ConsumirProducto",
                    "productoId": productoId
                  });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            } 
        },
        productoPerdido : async function(axios, productoId){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.ProductoPerdido', {
                    "$class": "org.hyperledger.composer.productos.ProductoPerdido",
                    "productoId": productoId
                  });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            } 
        },
        dividirProducto : async function(axios, productoId, trozos){
            try{
                let response = await axios.post('/api/org.hyperledger.composer.productos.DividirProducto', {
                    "$class": "org.hyperledger.composer.productos.DividirProducto",
                    "productoId": productoId,
                    "trozos": trozos
                  });
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            } 
        }


    },
    consulta : {
        getIdentity : async function(axios, tipo, id){
            try{
                let q = '/api/queries/getIdentity?participanteId=resource%3Aorg.hyperledger.composer.participantes.' + tipo + '%23' + id;
                let response = await axios.get(q);
                return returnResponse(response);
            }catch(error){
                return returnError(error);
            }
        }
    }

}

function returnResponse(response){
    return {
        "statusCode" : response.status,
        "data" : response.data
    }
}

function returnError(error) {
    return {
        "statusCode" : error.response.data.error.statusCode,
        "message" : error.response.data.error.message
    }
}