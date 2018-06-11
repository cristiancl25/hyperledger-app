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


async function getTransaccion(transaccionId){
    var rexistro = await getAssetRegistry(NS_PROD + '.Transaccion');
    return  await rexistro.get(transaccionId);
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

async function crearTransaccion(producto, orgId){
    const factory = getFactory();
    //Creación de los conceptos para la confirmación de la transacción
    var orgVenta = factory.newConcept(NS_PROD,'OrgConfirmacion');
    orgVenta.orgId = producto.operacionActual.orgId;
    orgVenta.confirmacion = false;

    var orgCompra = factory.newConcept(NS_PROD,'OrgConfirmacion');
    orgCompra.orgId = orgId;
    orgCompra.confirmacion = false;

    // Creación del asset Transacción
    var transaccion = factory.newResource(NS_PROD, 'Transaccion', producto.productoId + 
            '-' + orgVenta.orgId + '-' + orgCompra.orgId + '-' + new Date().toJSON());
    transaccion.producto = factory.newRelationship(NS_PROD, 'Producto', producto.productoId);
    transaccion.orgCompra = orgCompra;
    transaccion.orgVenta = orgVenta;

    var rexistroTransaccion = await getAssetRegistry(NS_PROD + '.Transaccion');
    await rexistroTransaccion.add(transaccion);

    // Actualización del estado del producto
    producto.estado = 'TRANSACCION';
    producto.transaccionId = transaccion.transaccionId;

    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.update(producto);
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
 * @param {org.hyperledger.composer.productos.PonerVentaProducto} datos
 * @transaction
*/
async function PonerVentaProducto(datos){
    const factory = getFactory();
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    var producto = await getProducto(datos.productoId);
    
    if (producto.operacionActual.orgId !== participante.orgId){
        throw new Error('Este producto no pertenece a la organización del usuario ' + participante.email);
    }

    if (producto.estado !== 'PARADO'){ 
        throw new Error('El producto no se puede poner en venta');
    }

    var venta = factory.newConcept(NS_PROD, 'DatosVenta');
    venta.tipoVenta = datos.tipoVenta;
    venta.unidadMonetaria = datos.unidadMonetaria;
    venta.precio = datos.precio;
    if (venta.tipoVenta === 'PUJA'){
        const pujaId = participante.orgId + '-' + new Date().toJSON();
        var puja = factory.newResource(NS_PROD, 'Puja', pujaId);
        puja.precioPartida = datos.precio;
        puja.producto = factory.newRelationship(NS_PROD, 'Producto', producto.productoId);
        puja.organizaciones = [];

        var reg = await getAssetRegistry(NS_PROD + '.Puja');
        await reg.add(puja);
        venta.pujaId = pujaId;
    }
    producto.estado = 'VENTA';
    producto.operacionActual.datosVenta = venta;

    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.update(producto);
}


/**
 *
 * @param {org.hyperledger.composer.productos.PujarProducto} datos
 * @transaction
*/
async function PujarProducto(datos){
    const factory = getFactory();
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    var producto = await getProducto(datos.productoId);

    if (producto.operacionActual.orgId === participante.orgId){
        throw new Error('Este producto ya pertenece a la organización del usuario ');
    }

    var regPuja = await getAssetRegistry(NS_PROD + '.Puja');
    var puja = await regPuja.get(producto.operacionActual.datosVenta.pujaId);

    if(datos.precio < puja.precioPartida){
        throw new Error('El precio tiene que ser superior al precio de partida');
    }

    const pujaOrg = puja.organizaciones.find(x => x.orgId === participante.orgId);
    if (pujaOrg === undefined){ //Si la organización no ha pujado se añade la puja
        var p = factory.newConcept(NS_PROD, 'PujaOrganizacion');
        p.precio = datos.precio;
        p.orgId = participante.orgId;
        puja.organizaciones.unshift(p);
    } else if (datos.precio <= pujaOrg.precio){ // Si ya se había pujado y la nueva puja es inferior se lanza un error
        throw new Error('El precio tiene que ser superior al anterior');
    } else {
        pujaOrg.precio = datos.precio;
    }

    puja.organizaciones.sort(function (a, b) {
        return (b.precio - a.precio)
    });

    await regPuja.update(puja);

}


/**
 *
 * @param {org.hyperledger.composer.productos.FinalizarPuja} datos
 * @transaction
*/
async function FinalizarPuja(datos){
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    var producto = await getProducto(datos.productoId);

    if (producto.operacionActual.orgId !== participante.orgId){
        throw new Error('El producto non partenece a la organización del participante');
    }

    var regPuja = await getAssetRegistry(NS_PROD + '.Puja');
    var puja = await regPuja.get(producto.operacionActual.datosVenta.pujaId);

    if (puja.organizaciones.length == 0){
        producto.estado = 'PARADO';
        delete producto.operacionActual.datosVenta;
        var regProd = await getAssetRegistry(NS_PROD + '.Producto');
        await regProd.update(producto);
    } else {
        const ganador = puja.organizaciones[0].orgId;
        puja.organizaciones.splice(0,1).orgId;
        await regPuja.update(puja);

        await crearTransaccion(producto, ganador);
    }
}


/**
 *
 * @param {org.hyperledger.composer.productos.ComprarProducto} datos
 * @transaction
*/
async function ComprarProducto(datos){
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    var producto = await getProducto(datos.productoId);
    
    if (participante.orgId === producto.operacionActual.orgId) {
        throw new Error ('El producto ya pertenece a la compañía');
    }
    
    if (producto.estado !== 'VENTA'){
        throw new Error('El producto no está en venta');
    }

    await crearTransaccion(producto, participante.orgId);
}


/**
 *
 * @param {org.hyperledger.composer.productos.ConfirmarTransaccion} datos
 * @transaction
*/
async function ConfirmarTransaccion(datos){
    const factory = getFactory();
    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    var regTran = await getAssetRegistry(NS_PROD + '.Transaccion');
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    var producto = await getProducto(datos.productoId);
    var transaccion = await getTransaccion(producto.transaccionId);

    if (participante.orgId !== transaccion.orgVenta.orgId && 
            participante.orgId !== transaccion.orgCompra.orgId) {
        // Si el participante no pertenece a ninguna organización de la trasacción
        throw new Error('El usuario ' + participante.email + ' no pertenece a esta transacción');
    }

    // TODO lanzar eventos
    if (!datos.confirmar) {
        // TODO caso rechazo en estado PUJA
        producto.estado = 'VENTA';
        delete producto.transaccionId;
        await regProd.update(producto);
        await regTran.remove(transaccion);
        return;

    } else if (participante.orgId === transaccion.orgVenta.orgId) {
        // Si el participante pertenece a la organización vendedora
        transaccion.orgVenta.confirmacion = true;

    } else if (participante.orgId === transaccion.orgCompra.orgId) {
        // Si el participante pertenece a la organización compradora
        const regLoc = await getAssetRegistry(NS_ORG + '.Localizacion');
        if (!datos.nuevaLocalizacion){
            throw new Error("Es obligatorio especificar la nueva localización del producto");
        }
        if (! await regLoc.exists(datos.nuevaLocalizacion)){
            throw new Error('Localización Inválida');
        }
        transaccion.orgCompra.confirmacion = true;
        transaccion.nuevaLocalizacion = datos.nuevaLocalizacion;

    }

    await regTran.update(transaccion);

    if (transaccion.orgVenta.confirmacion && transaccion.orgCompra.confirmacion){
        // Si confirmaron ambas compañías, el producto cambia de propietario
        var operacion = factory.newConcept(NS_PROD, 'Operacion');
        operacion.localizacion = factory.newRelationship(NS_ORG, 'Localizacion', transaccion.nuevaLocalizacion);
        operacion.fecha = new Date();
        operacion.orgId = transaccion.orgCompra.orgId;
        
        producto.operaciones.unshift(producto.operacionActual);
        producto.operacionActual = operacion;
        producto.estado = 'PARADO';
        delete producto.transaccionId;
        await regTran.remove(transaccion);
        await regProd.update(producto);
    }
}