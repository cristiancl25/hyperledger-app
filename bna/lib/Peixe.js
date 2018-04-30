const NS_ORG = 'org.peixeencadeado.organizacions'
const NS_PEIXE = 'org.peixeencadeado.peixe';
/**
 *
 * @param {org.peixeencadeado.peixe.CrearPeixe} datos
 * @transaction
 */
 async function crearPeixe(datos){

    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    const factory = getFactory();
    const peixeId = xerarPeixeId(participante.orgId);
    var peixe = factory.newResource(NS_PEIXE, 'Peixe', peixeId);
    var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
    coordenadas.lonxitude = datos.lonxitude;
    coordenadas.latitude = datos.latitude;

    var caracteristicas = factory.newConcept(NS_PEIXE,'Caracteristicas');
    caracteristicas.variedade = datos.variedade;
    caracteristicas.peso = datos.peso;

    var operacion = factory.newConcept(NS_PEIXE,'Operacion');
    operacion.coordenadas = coordenadas;
    operacion.descripcion = datos.descripcion;
    operacion.fecha = new Date();
    operacion.organizacion = factory.newRelationship(NS_ORG, 'Organizacion', participante.orgId);
    
    peixe.caracteristicas = caracteristicas;
    peixe.operacionActual = operacion;
    peixe.operacions = [];
    peixe.estado = 'CAPTURADO';
    var rexistroPeixe = await getAssetRegistry(NS_PEIXE + '.Peixe');
    await rexistroPeixe.add(peixe);

    var evento = factory.newEvent(NS_PEIXE, 'PeixeCreado');
    evento.peixeId = peixeId;
    evento.orgId = participante.orgId;
    evento.variedade = datos.variedade;
    emit(evento);

}

async function validarParticipante(participante){

    if (participante.getFullyQualifiedType() !== 'org.peixeencadeado.participantes.Usuario'){
        throw new Error('Participante ' + participante.getFullyQualifiedIdentifier() + ' non válido');
    }

    try{
        var rexistro = await getAssetRegistry(NS_ORG + '.Organizacion');
        var organizacion = await rexistro.get(participante.orgId);
    }catch(error){
        throw new Error('O usuario ' + participante.getFullyQualifiedIdentifier() +  ' pertence a unha organizacion non válida ( ' +  participante.orgId + ' )');
    }

    var find = false;
    organizacion.usuarios.forEach(function(usuario){
        if (participante.email === usuario['$identifier']){
            find = true;
            return;
        }
    });
    if (!find){
        throw new Error('O participante ' + participante.email + ' non pertence a organizacion ' + participante.orgId);
    }
}

function xerarPeixeId(orgId){
    return orgId + '-' + new Date().toJSON();
}

async function validarEstado(estado){

}

async function obterPeixe(peixeId){
    var rexistro = await getAssetRegistry(NS_PEIXE + '.Peixe');
    return  await rexistro.get(peixeId);
}

async function traspasarPeixe(peixeId){

    var participante = getCurrentParticipant();
    const factory = getFactory();
    var rexistroPeixe = await getAssetRegistry(NS_PEIXE + '.Peixe');
    var peixe = await rexistroPeixe.get(peixeId);
    await validarEstado(peixe.estado);

    peixe.operacions.push(peixe.operacionActual);

    var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
    coordenadas.lonxitude = 12;
    coordenadas.latitude = 34;

    var operacion = factory.newConcept(NS_PEIXE,'Operacion');
    operacion.captura = false;
    operacion.coordenadas = coordenadas;
    operacion.fecha = new Date();
    operacion.organizacion = factory.newRelationship(NS_ORG, 'Organizacion', participante.orgId);

    peixe.operacionActual = operacion;

    await rexistroPeixe.update(peixe);
}

/**
 *
 * @param {org.peixeencadeado.peixe.ComprarPeixe} datos
 * @transaction
*/
async function ComprarPeixe(datos){
    const factory = getFactory();
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    var peixe = await obterPeixe(datos.peixeId);

    var orgVenta = factory.newConcept(NS_PEIXE,'Org');
    orgVenta.orgId = peixe.operacionActual.organizacion.$identifier;
    orgVenta.confirmacion = false;

    var orgCompra = factory.newConcept(NS_PEIXE,'Org');
    orgCompra.orgId = participante.orgId;
    orgCompra.confirmacion = false;

    var transaccion = factory.newResource(NS_PEIXE, 'Transaccion', peixe.peixeId + '-' + peixe.orgId + '-' + participante.orgId + '-' + new Date().toJSON());
    transaccion.peixe = peixe;
    transaccion.orgCompra = orgCompra;
    transaccion.orgVenta = orgVenta;

    peixe.estado = 'TRANSACCION';
    peixe.transaccion = transaccion;
    var rexistroPeixe = await getAssetRegistry(NS_PEIXE + '.Peixe');
    await rexistroPeixe.update(peixe);

    var rexistroTransaccion = await getAssetRegistry(NS_PEIXE + '.Transaccion');
    await rexistroTransaccion.add(transaccion);
}


/**
 *
 * @param {org.peixeencadeado.peixe.ConfirmarTransaccion} datos
 * @transaction
*/
async function ConfirmarTransaccion(datos){
    const factory = getFactory();
    var participante = getCurrentParticipant();
    await validarParticipante(participante);
    var peixe = await obterPeixe(datos.peixeId);
    console.log(peixe);
}