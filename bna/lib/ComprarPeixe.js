/**
 *
 * @param {org.peixeencadeado.peixe.ComprarPeixe} datos
 * @transaction
*/
async function ComprarPeixe(datos){

    const NS_ORG = 'org.peixeencadeado.organizacions'
    const NS_PEIXE = 'org.peixeencadeado.peixe';
    var participante = getCurrentParticipant();
    const factory = getFactory();
    var rexistroPeixe = await getAssetRegistry(NS_PEIXE + '.Peixe');
    var peixe = await rexistroPeixe.get(datos.peixeId);
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

async function validarEstado(estado){

}