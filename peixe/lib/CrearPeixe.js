/**
 *
 * @param {org.peixeencadeado.peixe.CrearPeixe} crearPeixe
 * @transaction
 */
 async function crearPeixe(crearPeixe){
    var NS_ORG = 'org.peixeencadeado.organizacions'
    var NS_PEIXE = 'org.peixeencadeado.peixe';
    var factory = getFactory();
    var peixeId = xerarPeixeId();
    var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
    var peixe = factory.newResource(NS_PEIXE, 'Peixe', peixeId);

    var rexistroPeixe = await getAssetRegistry(NS_PEIXE + '.Peixe')
    coordenadas.lonxitude = crearPeixe.lonxitude;
    coordenadas.latitude = crearPeixe.latitude;
    peixe.coordenadas = coordenadas;
    peixe.variedade = crearPeixe.variedade;
    peixe.dataCaptura = new Date();
    peixe.pesqueira = factory.newRelationship(NS_ORG, 'Pesqueira', 'pesqueira1');
    peixe.compras = [];
    peixe.estado = 'CAPTURADO';
    peixe.peso = crearPeixe.peso;
    await rexistroPeixe.add(peixe)
    var evento = factory.newEvent(NS_PEIXE, 'PeixeCreado');
    evento.peixeId = peixe.peixeId;
    //console.log(getCurrentParticipant());
    console.log('-------------------------------------------------------------------------------------------------------');
    //console.log(getCurrentIdentity());
    emit(evento);
}

function xerarPeixeId(){
    return "peixe" + Date().toString();
}