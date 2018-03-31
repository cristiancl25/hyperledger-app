/**
 *
 * @param {org.peixeencadeado.peixe.CrearPeixe} crearPeixe
 * @transaction
 */
 async function crearPeixe(crearPeixe){
    const NS_ORG = 'org.peixeencadeado.organizacions'
    const NS_PEIXE = 'org.peixeencadeado.peixe';
    var participante = getCurrentParticipant();
    validarParticipante(NS_ORG, participante);
    const factory = getFactory();
    const peixeId = xerarPeixeId(participante.orgId);
    var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
    var peixe = factory.newResource(NS_PEIXE, 'Peixe', peixeId);

    var rexistroPeixe = await getAssetRegistry(NS_PEIXE + '.Peixe');
    coordenadas.lonxitude = crearPeixe.lonxitude;
    coordenadas.latitude = crearPeixe.latitude;
    peixe.coordenadas = coordenadas;
    peixe.variedade = crearPeixe.variedade;
    peixe.dataCaptura = new Date();
    peixe.pesqueira = factory.newRelationship(NS_ORG, 'Pesqueira', participante.orgId);
    peixe.compras = [];
    peixe.estado = 'CAPTURADO';
    peixe.peso = crearPeixe.peso;
    await rexistroPeixe.add(peixe);

    var evento = factory.newEvent(NS_PEIXE, 'PeixeCreado');
    evento.peixeId = peixe.peixeId;
    evento.orgId = participante.orgId;
    emit(evento);
}

function validarParticipante(NS_ORG, participante){
    return getAssetRegistry(NS_ORG + '.Pesqueira')
    .then(function(rexistroPesqueira){
        return rexistroPesqueira.exists(participante.orgId);
    })
    .then(function(existe){
        
    });

}

function xerarPeixeId(orgId){
    return orgId + '-' + new Date().toJSON();
}