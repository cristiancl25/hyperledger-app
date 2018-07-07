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
                let response = await axios.get('/api/org.hyperledger.composer.productos.Producto/' + productoId);
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