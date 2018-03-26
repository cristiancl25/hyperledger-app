/**
 *
 * @param {org.peixeencadeado.peixe.SetupDemo} setupDemo
 * @transaction
 */
function setupDemo(setupDemo) {
    var factory = getFactory();
    var NS_PAR = 'org.peixeencadeado.participantes';
    var NS_PEIXE = 'org.peixeencadeado.peixe';
    var NS_ORG = 'org.peixeencadeado.organizacions';

    var participantes = [
        factory.newResource(NS_PAR, 'Participante', 'participante1'),
        factory.newResource(NS_PAR, 'Participante', 'participante2')
    ];

    var peixes = [
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe1'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe2'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe3'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe4'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe5'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe6'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe7'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe8'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe9'),
        factory.newResource(NS_PEIXE, 'Peixe', 'peixe10')
    ];
        
    return getParticipantRegistry(NS_PAR + '.Participante')
    .then(function(rexistroParticipante) {
        participantes.forEach(function(participante, index){
            participante.nome = 'participante' + (index + 1);
        });
        return rexistroParticipante.addAll(participantes);
    })
    .then(function() {
        return getAssetRegistry(NS_ORG + '.Pesqueira');
    })
    .then(function(rexistroPesqueira) {
        pesqueira = factory.newResource(NS_ORG, 'Pesqueira','pesqueira1');
        pesqueira.email = pesqueira.orgId;
        pesqueira.administrador = factory.newRelationship(NS_PAR, 'Participante', 'participante1');
        return rexistroPesqueira.add(pesqueira);
    })
    .then(function() {
        return getAssetRegistry(NS_ORG + '.Empresa');
    })
    .then(function(rexistroEmpresa) {        
        empresa = factory.newResource(NS_ORG, 'Empresa','empresa1');
        empresa.email = empresa.orgId;
        empresa.administrador = factory.newRelationship(NS_PAR, 'Participante', 'participante2');
        return rexistroEmpresa.add(empresa);
    })
    .then(function() {
      return getAssetRegistry(NS_PEIXE + '.Peixe');
    })
    .then(function(rexistroPeixe) {
        peixes.forEach(function(peixe, index) {
            var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
            coordenadas.lonxitude = 3.14;
            coordenadas.latitude = -74.23;
            peixe.coordenadas = coordenadas;
            peixe.variedade = 'xurelo';
            peixe.dataCaptura = new Date();
            peixe.pesqueira = factory.newRelationship(NS_ORG, 'Pesqueira', 'pesqueira1');
            peixe.compras = [];
            peixe.estado = 'CAPTURADO';
            peixe.peso = 1.1;
        });
        return rexistroPeixe.addAll(peixes);
    })
    .catch(function(error){
        throw new Error(error);
    });
}