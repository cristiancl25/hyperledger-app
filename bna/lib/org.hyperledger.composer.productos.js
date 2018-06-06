const NS_PAR = 'org.hyperledger.composer.participantes';
const NS_PROD = 'org.hyperledger.composer.productos';
const NS_ORG = 'org.hyperledger.composer.organizaciones';


function generarIdProducto(orgId){
    return orgId + '-' + new Date().toJSON() + '-' + Math.floor(Math.random()*1000);
}


async function getProducto(productoId){
    var rexistro = await getAssetRegistry(NS_PROD + '.Producto');
    return  await rexistro.get(productoId);
}


async function validarParticipante(participante){
    if (participante.getFullyQualifiedType() !== (NS_PAR + '.Usuario')){
        throw new Error('Participante ' + participante.getFullyQualifiedIdentifier() + ' non válido');
    }

    try{
        var rexistro = await getAssetRegistry(NS_ORG + '.Organizacion');
        var organizacion = await rexistro.get(participante.orgId);
    }catch(error){
        throw new Error('El usuario' + participante.getFullyQualifiedIdentifier() + 
                ' pertenece a unha organizacion no válida ( ' +  participante.orgId + ' )');
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
 * @param {org.hyperledger.composer.productos.CrearTipoProducto} datos
 * @transaction
 */
async function CrearTipoProducto(datos) {
    var factory = getFactory();
    var tipoProd = factory.newResource(NS_PROD, 'TipoProducto', datos.tipo);
    var reg = await getAssetRegistry(NS_PROD + '.TipoProducto');
    await reg.add(tipoProd);
}


/**
 *
 * @param {org.hyperledger.composer.productos.CrearProducto} datos
 * @transaction
 */
 async function CrearProducto(datos){
    var participante = getCurrentParticipant();
    await validarParticipante(participante);

    // Se comprueba que existe el TipoProducto solicitado
    var regTipoProd = await getAssetRegistry(NS_PROD + '.TipoProducto');
    const tipoProducto = datos.caracteristicas.tipoProducto.$identifier;
    if (! await regTipoProd.exists(tipoProducto)){
        throw new Error('El tipo de producto ' + tipoProducto 
                + ' no existe, es necesario crearlo antes');
    }
    
    const factory = getFactory();
    const productoId = generarIdProducto(participante.orgId);
    var regLoc = await getAssetRegistry(NS_ORG + '.Localizacion');

    var localizacionId;
    if (datos.loc){
        // Creación de una nueva localización
        localizacionId = new Date().toJSON(); //TODO ajustar el id
        var loc = factory.newResource(NS_ORG, 'Localizacion', localizacionId);
        loc.latitud = datos.loc.latitud;
        loc.longitud = datos.loc.longitud;
        loc.direccion = datos.loc.direccion;
        await regLoc.add(loc);
    } else {
        // Comprobación de que la Localización solicitada existe
        if (! await regLoc.exists(datos.localizacionId)){
            throw new Error('La localización ' + datos.localizacionId + ' no existe');
        }
        localizacionId = datos.localizacionId;
    }

    // Características del producto
    var caracteristicas = factory.newConcept(NS_PROD,'Caracteristicas');
    caracteristicas.tipoProducto = factory.newRelationship(NS_PROD, 'TipoProducto', tipoProducto);
    caracteristicas.variedadProducto = datos.caracteristicas.variedadProducto;
    caracteristicas.descripcion = datos.caracteristicas.descripcion;
    caracteristicas.tipo = datos.caracteristicas.tipo;
    caracteristicas.peso = datos.caracteristicas.peso;
    if (caracteristicas.tipo === 'UNIDAD'){
        caracteristicas.unidades = datos.caracteristicas.unidades;
    } else {
        caracteristicas.magnitudPeso = datos.caracteristicas.magnitudPeso;
    }

    // Creación de la operación inicial
    var operacion = factory.newConcept(NS_PROD, 'Operacion');
    operacion.localizacion = factory.newRelationship(NS_ORG, 'Localizacion', localizacionId);
    operacion.fecha = new Date();
    operacion.orgId = participante.orgId;
    
    // Creación del producto
    var producto = factory.newResource(NS_PROD, 'Producto', productoId);
    if (datos.identificador){
        producto.identificador = datos.identificador;
    }
    producto.caracteristicas = caracteristicas;
    producto.operacionActual = operacion;
    producto.operaciones = [];
    producto.estado = 'PARADO';
    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.add(producto);

    // Creación del evento para informar del nuevo producto
    var evento = factory.newEvent(NS_PROD, 'ProductoCreado');
    evento.productoId = productoId;
    evento.orgId = participante.orgId;
    evento.tipoProducto = tipoProducto;
    evento.variedadProducto = datos.caracteristicas.variedadProducto;
    emit(evento);
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

    var transaccion = factory.newResource(NS_PROD, 'Transaccion', Producto.productoId + 
            '-' + Producto.orgId + '-' + participante.orgId + '-' + new Date().toJSON());
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