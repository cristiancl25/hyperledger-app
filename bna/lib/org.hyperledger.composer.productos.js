const NS_PAR = 'org.hyperledger.composer.participantes';
const NS_PROD = 'org.hyperledger.composer.productos';
const NS_ORG = 'org.hyperledger.composer.organizaciones';

/**
 *
 * @param {org.hyperledger.composer.productos.CrearProducto} datos
 * @transaction
 */
 async function CrearProducto(datos){

    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    const factory = getFactory();
    const productoId = generarIdProducto(participante.orgId);
    var Producto = factory.newResource(NS_PROD, 'Producto', productoId);
    var coordenadas = factory.newConcept(NS_PROD,'Coordenadas');
    coordenadas.longitud = datos.longitud;
    coordenadas.latitud = datos.latitud;

    var caracteristicas = factory.newConcept(NS_PROD,'Caracteristicas');
    caracteristicas.variedad = datos.variedad;
    caracteristicas.peso = datos.peso;

    var operacion = factory.newConcept(NS_PROD,'Operacion');
    operacion.coordenadas = coordenadas;
    operacion.descripcion = datos.descripcion;
    operacion.fecha = new Date();
    operacion.organizacion = factory.newRelationship(NS_ORG, 'Organizacion', participante.orgId);
    
    Producto.caracteristicas = caracteristicas;
    Producto.operacionActual = operacion;
    Producto.operaciones = [];
    Producto.estado = 'CAPTURADO';
    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.add(Producto);

    var evento = factory.newEvent(NS_PROD, 'ProductoCreado');
    evento.productoId = productoId;
    evento.orgId = participante.orgId;
    evento.variedad = datos.variedad;
    emit(evento);

}

async function validarParticipante(participante){

    if (participante.getFullyQualifiedType() !== (NS_PAR + '.Usuario')){
        throw new Error('Participante ' + participante.getFullyQualifiedIdentifier() + ' non válido');
    }

    try{
        var rexistro = await getAssetRegistry(NS_ORG + '.Organizacion');
        var organizacion = await rexistro.get(participante.orgId);
    }catch(error){
        throw new Error('El usuario' + participante.getFullyQualifiedIdentifier() +  ' pertenece a unha organizacion no válida ( ' +  participante.orgId + ' )');
    }

    var find = false;
    organizacion.usuarios.forEach(function(usuario){
        if (participante.email === usuario['$identifier']){
            find = true;
            return;
        }
    });
    if (!find){
        throw new Error('El participante ' + participante.email + ' no pertenece a la organizacion ' + participante.orgId);
    }
}

function generarIdProducto(orgId){
    return orgId + '-' + new Date().toJSON();
}

async function validarEstado(estado){

}

async function getProducto(productoId){
    var rexistro = await getAssetRegistry(NS_PROD + '.Producto');
    return  await rexistro.get(productoId);
}

async function traspasarProducto(productoId){

    var participante = getCurrentParticipant();
    const factory = getFactory();
    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    var Producto = await regProd.get(productoId);
    await validarEstado(Producto.estado);

    Producto.operaciones.push(Producto.operacionActual);

    var coordenadas = factory.newConcept(NS_PROD,'Coordenadas');
    coordenadas.longitud = 12;
    coordenadas.latitud = 34;

    var operacion = factory.newConcept(NS_PROD,'Operacion');
    operacion.captura = false;
    operacion.coordenadas = coordenadas;
    operacion.fecha = new Date();
    operacion.organizacion = factory.newRelationship(NS_ORG, 'Organizacion', participante.orgId);

    Producto.operacionActual = operacion;

    await regProd.update(Producto);
}

/**
 *
 * @param {org.hyperledger.composer.productos.ComprarProducto} datos
 * @transaction
*/
async function ComprarProducto(datos){
    const factory = getFactory();
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    var Producto = await getProducto(datos.productoId);

    var orgVenta = factory.newConcept(NS_PROD,'OrgConfirmacion');
    orgVenta.orgId = Producto.operacionActual.organizacion.$identifier;
    orgVenta.confirmacion = false;

    var orgCompra = factory.newConcept(NS_PROD,'OrgConfirmacion');
    orgCompra.orgId = participante.orgId;
    orgCompra.confirmacion = false;

    var transaccion = factory.newResource(NS_PROD, 'Transaccion', Producto.productoId + '-' + Producto.orgId + '-' + participante.orgId + '-' + new Date().toJSON());
    transaccion.producto = Producto;
    transaccion.orgCompra = orgCompra;
    transaccion.orgVenta = orgVenta;

    Producto.estado = 'TRANSACCION';
    Producto.transaccion = transaccion;
    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.update(Producto);

    var rexistroTransaccion = await getAssetRegistry(NS_PROD + '.Transaccion');
    await rexistroTransaccion.add(transaccion);
}


/**
 *
 * @param {org.hyperledger.composer.productos.ConfirmarTransaccion} datos
 * @transaction
*/
async function ConfirmarTransaccion(datos){
    //const factory = getFactory();
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    //var Producto = await getProducto(datos.productoId);
}