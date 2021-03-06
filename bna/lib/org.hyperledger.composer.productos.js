const NS_PAR = 'org.hyperledger.composer.participantes';
const NS_PROD = 'org.hyperledger.composer.productos';
const NS_ORG = 'org.hyperledger.composer.organizaciones';

function getTime(){
    var time = new Date().toJSON().split(':');
    return time[0] + ':' + time[1]
}

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
            '-' + orgVenta.orgId + '-' + orgCompra.orgId + '-' + getTime());
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

async function generarProducto(datos){
    // Se comprueba que existe el TipoProducto solicitado
    var regTipoProd = await getAssetRegistry(NS_PROD + '.TipoProducto');
    const tipoProducto = datos.caracteristicas.tipoProducto.$identifier;
    if (! await regTipoProd.exists(tipoProducto)){
        throw new Error('El tipo de producto ' + tipoProducto 
                + ' no existe, es necesario crearlo antes');
    }
    
    const factory = getFactory();
    var regLoc = await getAssetRegistry(NS_ORG + '.Localizacion');

    var localizacionId;
    if (datos.loc){
        // Creación de una nueva localización
        localizacionId = datos.productoId;
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
    caracteristicas.magnitudPeso = datos.caracteristicas.magnitudPeso;
    if (caracteristicas.tipo === 'UNIDAD'){
        caracteristicas.unidades = datos.caracteristicas.unidades;
    }

    // Creación de la operación inicial
    var operacion = factory.newConcept(NS_PROD, 'Operacion');
    operacion.localizacion = factory.newRelationship(NS_ORG, 'Localizacion', localizacionId);
    operacion.fecha = getTime();
    operacion.orgId = datos.orgId;
    
    // Creación del producto
    var producto = factory.newResource(NS_PROD, 'Producto', datos.productoId);
    if (datos.identificador){
        producto.identificador = datos.identificador;
    }
    producto.imagen = datos.imagen;
    producto.caracteristicas = caracteristicas;
    producto.operacionActual = operacion;
    producto.operaciones = [];
    producto.estado = 'PARADO';
    return producto;
}
/**
 *
 * @param {org.hyperledger.composer.productos.CrearProducto} datos
 * @transaction
 */
 async function CrearProducto(datos){
    var participante = getCurrentParticipant();
    datos.productoId = participante.orgId + '-' + getTime() + '-' + datos.identificador;
    datos.orgId = participante.orgId;
    var producto = await generarProducto(datos);

    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.add(producto);
}


/**
 *
 * @param {org.hyperledger.composer.productos.PonerVentaProducto} datos
 * @transaction
*/
async function PonerVentaProducto(datos){
    const factory = getFactory();
    var participante = getCurrentParticipant();
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
        const pujaId = participante.orgId + '-' + getTime();
        var puja = factory.newResource(NS_PROD, 'Puja', pujaId);
        puja.precioPartida = datos.precio;
        puja.producto = factory.newRelationship(NS_PROD, 'Producto', producto.productoId);
        puja.organizaciones = [];

        var reg = await getAssetRegistry(NS_PROD + '.Puja');
        await reg.add(puja);
        venta.pujaId = pujaId;
        producto.estado = 'PUJA';
    } else {
        producto.estado = 'VENTA';
    }
    producto.operacionActual.datosVenta = venta;

    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.update(producto);

    // Creación del evento para informar del nuevo producto
    var evento = factory.newEvent(NS_PROD, 'ProductoEnVenta');
    evento.orgOrigen = participante.orgId;
    evento.productoId = producto.productoId;
    evento.tipoProducto = producto.caracteristicas.tipoProducto.$identifier;
    evento.tipoVenta = producto.operacionActual.datosVenta.tipoVenta;
    evento.variedadProducto = producto.caracteristicas.variedadProducto;
    emit(evento);
}


/**
 *
 * @param {org.hyperledger.composer.productos.PujarProducto} datos
 * @transaction
*/
async function PujarProducto(datos){
    const factory = getFactory();
    var participante = getCurrentParticipant();
    var producto = await getProducto(datos.productoId);

    if (producto.operacionActual.orgId === participante.orgId){
        throw new Error('Este producto ya pertenece a la organización del usuario ');
    }

    if (producto.estado !== 'PUJA'){
        throw new Error('El producto no está en Puja');
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
    var evento = factory.newEvent(NS_PROD, 'NuevaPuja');
    evento.orgOrigen = participante.orgId;
    evento.orgDestino = producto.operacionActual.orgId;
    evento.productoId = producto.productoId;
    emit(evento);

}

async function pujaATransaccion(producto){
    const factory = getFactory();
    var regPuja = await getAssetRegistry(NS_PROD + '.Puja');
    var puja = await regPuja.get(producto.operacionActual.datosVenta.pujaId);

    if (puja.organizaciones.length == 0){
        producto.estado = 'PARADO';
        delete producto.operacionActual.datosVenta;
        var regProd = await getAssetRegistry(NS_PROD + '.Producto');
        await regPuja.remove(puja);
        await regProd.update(producto);
    } else {
        const ganador = puja.organizaciones[0].orgId;
        puja.organizaciones.splice(0,1).orgId;
        await regPuja.update(puja);

        await crearTransaccion(producto, ganador);

        let evento = factory.newEvent(NS_PROD, 'GanadorPuja');
        evento.orgDestino = ganador;
        evento.orgOrigen = producto.operacionActual.orgId;
        evento.productoId = producto.productoId;
        emit(evento);
    }
}
/**
 *
 * @param {org.hyperledger.composer.productos.FinalizarPuja} datos
 * @transaction
*/
async function FinalizarPuja(datos){
    var participante = getCurrentParticipant();
    var producto = await getProducto(datos.productoId);
    if (producto.estado != 'PUJA'){
        throw new Error ('El producto non está en PUJA');
    }
    if (producto.operacionActual.orgId !== participante.orgId){
        throw new Error('El producto non partenece a la organización del participante');
    }
    await pujaATransaccion(producto);
}


/**
 *
 * @param {org.hyperledger.composer.productos.ComprarProducto} datos
 * @transaction
*/
async function ComprarProducto(datos){
    const factory = getFactory();
    var participante = getCurrentParticipant();
    var producto = await getProducto(datos.productoId);
    
    if (participante.orgId === producto.operacionActual.orgId) {
        throw new Error ('El producto ya pertenece a la compañía');
    }
    
    if (producto.estado !== 'VENTA'){
        throw new Error('El producto no está en venta');
    }

    await crearTransaccion(producto, participante.orgId);
    
    let evento = factory.newEvent(NS_PROD, 'ProductoComprado');
    evento.orgDestino = producto.operacionActual.orgId;
    evento.orgOrigen = participante.orgId;
    evento.productoId = producto.productoId;
    emit(evento);
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
    var producto = await getProducto(datos.productoId);
    var transaccion = await getTransaccion(producto.transaccionId);

    if (producto.estado !== 'TRANSACCION') {
        throw new Error('El  producto no está en estado TRANSACCIÓN');
    }

    if (participante.orgId !== transaccion.orgVenta.orgId && 
            participante.orgId !== transaccion.orgCompra.orgId) {
        // Si el participante no pertenece a ninguna organización de la trasacción
        throw new Error('El usuario ' + participante.email + ' no pertenece a esta transacción');
    }

    if (!datos.confirmar) {
        producto.estado = 'VENTA';
        delete producto.transaccionId;
        await regProd.update(producto);
        await regTran.remove(transaccion);
        if (producto.operacionActual.datosVenta.pujaId){
            await pujaATransaccion(producto);
        }
        let evento = factory.newEvent(NS_PROD, 'EstadoTransaccion');
        if (participante.orgId === transaccion.orgVenta.orgId) {
            evento.orgDestino = transaccion.orgCompra.orgId;
            evento.orgOrigen = transaccion.orgVenta.orgId;
        }else{
            evento.orgDestino = transaccion.orgVenta.orgId;
            evento.orgOrigen = transaccion.orgCompra.orgId;
        }
        evento.productoId = producto.productoId;
        evento.confirmacion = false;
        emit(evento);
        return;

    } else if (participante.orgId === transaccion.orgVenta.orgId) {
        // Si el participante pertenece a la organización vendedora
        transaccion.orgVenta.confirmacion = true;
        let evento = factory.newEvent(NS_PROD, 'EstadoTransaccion');
        evento.orgDestino = transaccion.orgCompra.orgId;
        evento.orgOrigen = transaccion.orgVenta.orgId;
        evento.productoId = producto.productoId;
        evento.confirmacion = true;
        emit(evento);

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
        let evento = factory.newEvent(NS_PROD, 'EstadoTransaccion');
        evento.orgDestino = transaccion.orgVenta.orgId;
        evento.orgOrigen = transaccion.orgCompra.orgId;
        evento.productoId = producto.productoId;
        evento.confirmacion = true;
        emit(evento);
    }
    await regTran.update(transaccion);

    if (transaccion.orgVenta.confirmacion && transaccion.orgCompra.confirmacion){
        // Si confirmaron ambas compañías, el producto cambia de propietario
        var operacion = factory.newConcept(NS_PROD, 'Operacion');
        operacion.localizacion = factory.newRelationship(NS_ORG, 'Localizacion', transaccion.nuevaLocalizacion);
        operacion.fecha = getTime();
        operacion.orgId = transaccion.orgCompra.orgId;
        
        producto.operaciones.unshift(producto.operacionActual);
        producto.operacionActual = operacion;
        producto.estado = 'PARADO';
        delete producto.transaccionId;
        await regTran.remove(transaccion);
        await regProd.update(producto);
    }
}



/**
 *
 * @param {org.hyperledger.composer.productos.DividirProducto} datos
 * @transaction
*/
async function DividirProducto(datos){
    const factory = getFactory();
    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    var participante = getCurrentParticipant();
    var producto = await getProducto(datos.productoId);

    if (producto.operacionActual.orgId !== participante.orgId){
        throw new Error('El producto non partenece a la organización del participante');
    }

    if (producto.estado !== 'PARADO'){
        throw new Error('El producto no se puede dividir');
    }

    let unidades = 0;
    let peso = 0; 

    if (producto.caracteristicas.tipo === 'UNIDAD'){
        for (var i = 0; i < datos.trozos.length; i++) {
            if (datos.trozos[i].unidades){
                unidades += datos.trozos[i].unidades;
            } else {
                throw new Error('Es necesario especificar la división por unidad o peso');
            }
        }
    } else if (producto.caracteristicas.tipo === 'PESO'){
        for (i = 0; i < datos.trozos.length; i++) {
            if (datos.trozos[i].peso) {
                peso += datos.trozos[i].peso;
            } else {
                throw new Error('Es necesario especificar la división por unidad o peso');
            }
        }
    }
    if (unidades > 0 && peso > 0){
        throw new Error('La división solo se pude hacer por peso o unidad, no por ambas');
    }
    if ( unidades > producto.caracteristicas.unidades){
        throw new Error('La suma de las unidades no puede ser superior a las unidades del producto');
    }
    if ( peso > producto.caracteristicas.peso){
        throw new Error('La suma de los pesos no puede ser superior al peso del producto');
    }

    var sucesores = [];
    for (i = 0; i < datos.trozos.length; i++) {
        let productoId = producto.productoId + '-' + i;
        sucesores.push(productoId);

        let caracteristicas = factory.newConcept(NS_PROD,'Caracteristicas');
        caracteristicas.tipoProducto = producto.caracteristicas.tipoProducto;
        caracteristicas.variedadProducto = producto.caracteristicas.variedadProducto;
        caracteristicas.descripcion = producto.caracteristicas.descripcion;
        caracteristicas.tipo = producto.caracteristicas.tipo;
        caracteristicas.magnitudPeso = producto.caracteristicas.magnitudPeso;
        if (producto.caracteristicas.tipo == 'UNIDAD'){
            caracteristicas.unidades = datos.trozos[i].unidades;
            caracteristicas.peso = producto.caracteristicas.peso;
        } else {
            caracteristicas.peso = datos.trozos[i].peso;
        }

        let p = await generarProducto({
            "productoId": productoId,
            "identificador" : datos.trozos[i].identificador,
            "orgId" : participante.orgId,
            "caracteristicas" : caracteristicas,
            "localizacionId" : producto.operacionActual.localizacion.$identifier,
            "imagen" : datos.trozos[i].imagen
        });

        p.predecesor = producto.productoId;
        await regProd.add(p);
    }
    producto.sucesores = sucesores; 
    producto.estado = 'DIVIDIDO';
    await regProd.update(producto);
}

/**
 *
 * @param {org.hyperledger.composer.productos.CancelarVenta} datos
 * @transaction
*/
async function CancelarVenta(datos){
    var participante = getCurrentParticipant();
    var producto = await getProducto(datos.productoId);
    
    if (participante.orgId !== producto.operacionActual.orgId) {
        throw new Error ('El producto no pertenece a la compañía');
    }
    
    if (producto.estado !== 'VENTA' && producto.estado !== 'PUJA'){
        throw new Error('El producto no está en venta o puja para poder cacelarlo');
    }

    if (producto.estado == 'PUJA'){
        // Si está en estado PUJA se borra el registro de la puja
        var regPuja = await getAssetRegistry(NS_PROD + '.Puja');
        let puja = await regPuja.get(producto.operacionActual.datosVenta.pujaId);
        await regPuja.remove(puja);
    }

    producto.estado = 'PARADO';
    delete producto.operacionActual.datosVenta;

    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.update(producto);
}

/**
 *
 * @param {org.hyperledger.composer.productos.ConsumirProducto} datos
 * @transaction
*/
async function ConsumirProducto(datos){
    var participante = getCurrentParticipant();
    var producto = await getProducto(datos.productoId);
    
    if (participante.orgId !== producto.operacionActual.orgId) {
        throw new Error ('El producto no pertenece a la compañía');
    }
    
    if (producto.estado !== 'PARADO'){
        throw new Error('El producto no se puede consumir');
    }
    
    producto.estado = 'CONSUMIDO';

    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    await regProd.update(producto);
}


/**
 *
 * @param {org.hyperledger.composer.productos.ProductoPerdido} datos
 * @transaction
*/
async function ProductoPerdido(datos){
    var participante = getCurrentParticipant();
    var producto = await getProducto(datos.productoId);
    
    if (participante.orgId !== producto.operacionActual.orgId) {
        throw new Error ('El producto no pertenece a la compañía');
    }
    
    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    var regPuja = await getAssetRegistry(NS_PROD + '.Puja');

    if (producto.estado === 'CONSUMIDO' || producto.estado === 'PERDIDO' || producto.estado == 'DIVIDIDO'){
        throw new Error('El producto ya está en un estado de finlalización');

    } else if (producto.estado === 'PUJA') {
        // Si está en estado PUJA se borra el registro de la puja
        let puja = await regPuja.get(producto.operacionActual.datosVenta.pujaId);
        await regPuja.remove(puja);

    } else if (producto.estado === 'TRANSACCION'){
        throw new Error ('Primero es necesario Cancelar la transacción');
    }

    producto.estado = 'PERDIDO';
    delete producto.operacionActual.datosVenta;

    await regProd.update(producto);
}

/**
 * @param {org.hyperledger.composer.productos.ProductosPujados} datos
 * @returns {org.hyperledger.composer.productos.Producto[]}
 * @transaction
*/
async function ProductosPujados(datos) {
    var regProd = await getAssetRegistry(NS_PROD + '.Producto');
    var regPuja = await getAssetRegistry(NS_PROD + '.Puja');
    var participante = getCurrentParticipant();
    let pujas = await regPuja.getAll();
    
    
    let p = pujas.filter((puja) => {
        var resultado = puja.organizaciones.filter((organizacion) => {
            return organizacion.orgId === participante.orgId
        })
        return resultado.length === 1
    })

    var productos = [];
    for(let i=0; i < p.length; i++){
        let producto = await regProd.get(p[i].producto.$identifier);
        if (producto.estado === 'PUJA'){
            productos.push(producto);
        }
    }
    return productos;
}
