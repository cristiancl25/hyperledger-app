export const composer = {
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
    getProducto : async function(axios, productoId){
        try{
            let response = await axios.get('/api/org.hyperledger.composer.productos.Producto/' + productoId);
            return returnResponse(response);
        }catch(error){
            return returnError(error);
        }
    },
    getProductos : async function(axios){
        try{
            let response = await axios.get('/api/org.hyperledger.composer.productos.Producto/');
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
    getOrganizacion : async function(axios, id){
        try{
            let response = await axios.get('/api/org.hyperledger.composer.organizaciones.Organizacion/' + id);
            return returnResponse(response);
        }catch(error){
            return returnError(error);
        }
    },

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