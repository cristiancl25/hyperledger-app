/**
 *
 * @param {org.peixeencadeado.peixe.CrearPeixe} crearPeixe
 * @transaction
 */
 function crearPeixe(crearPeixe){
    var NS_ORG = 'org.peixeencadeado.organizacions'
    var NS_PEIXE = 'org.peixeencadeado.peixe';
    var factory = getFactory();
    var peixeId = xerarPeixeId();
    var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
    var peixe = factory.newResource(NS_PEIXE, 'Peixe', peixeId);

    return getAssetRegistry(NS_PEIXE + '.Peixe')
    .then(function(rexistroPeixe) {
        coordenadas.lonxitude = crearPeixe.lonxitude;
        coordenadas.latitude = crearPeixe.latitude;
        peixe.coordenadas = coordenadas;
        peixe.variedade = crearPeixe.variedade;
        peixe.dataCaptura = new Date();
        peixe.pesqueira = factory.newRelationship(NS_ORG, 'Pesqueira', 'pesqueira1');
        peixe.compras = [];
        peixe.estado = 'CAPTURADO';
        peixe.peso = crearPeixe.peso;
        return rexistroPeixe.add(peixe);
    }).then(function(){
        var evento = factory.newEvent(NS_PEIXE, 'PeixeCreado');
        evento.peixeId = peixe.peixeId;
        console.log(getCurrentParticipant().getFullyQualifiedIdentifier());
        console.log(getCurrentParticipant().getFullyQualifiedIdentifier().split('#'));
        emit(evento);
    })
    .catch(function(error){
        throw new Error(error);
    });
}

function xerarPeixeId(){
    return "peixe" + Date().toString();
}