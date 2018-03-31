/**
 *
 * @param {org.peixeencadeado.peixe.SetupDemo} setupDemo
 * @transaction
 */
async function setupDemo(setupDemo) {
    var factory = getFactory();
    var NS_PAR = 'org.peixeencadeado.participantes';
    var NS_PEIXE = 'org.peixeencadeado.peixe';
    var NS_ORG = 'org.peixeencadeado.organizacions';

    var participantes = [
        factory.newResource(NS_PAR, 'Usuario', 'participante1@pes1'),
        factory.newResource(NS_PAR, 'Usuario', 'participante1@org1'),
        factory.newResource(NS_PAR, 'Usuario', 'participante1@org2')
    ];

    var admins = [
        factory.newResource(NS_PAR, 'OrgAdmin', 'admin@pes1'),
        factory.newResource(NS_PAR, 'OrgAdmin', 'admin@org1'),
        factory.newResource(NS_PAR, 'OrgAdmin', 'admin@org2')
    ]

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
        
    var rexistroParticipante = await getParticipantRegistry(NS_PAR + '.Usuario');
    participantes[0].nome = 'participante1';
    participantes[0].nameSpaceOrg = 'Pesqueira';
    participantes[0].orgId = participantes[0].email.split('@')[1];

    participantes[1].nome = 'participante1';
    participantes[1].nameSpaceOrg = 'Empresa';
    participantes[1].orgId = participantes[1].email.split('@')[1];

    participantes[2].nome = 'participante1';
    participantes[2].nameSpaceOrg = 'Empresa';
    participantes[2].orgId = participantes[2].email.split('@')[1];
    await rexistroParticipante.addAll(participantes);

    var rexistroAdmins = await getParticipantRegistry(NS_PAR + '.OrgAdmin');
    admins[0].nome = 'admin1';
    admins[0].nameSpaceOrg = 'Pesqueira';
    admins[0].orgId = admins[0].email.split('@')[1];

    admins[1].nome = 'admin1';
    admins[1].nameSpaceOrg = 'Empresa';
    admins[1].orgId = admins[1].email.split('@')[1];

    admins[2].nome = 'admin1';
    admins[2].nameSpaceOrg = 'Empresa';
    admins[2].orgId = admins[2].email.split('@')[1];
    await rexistroAdmins.addAll(admins);

    var rexistroPesqueira = await getAssetRegistry(NS_ORG + '.Pesqueira');
    var pesqueira = factory.newResource(NS_ORG, 'Pesqueira','pes1');
    pesqueira.administrador = factory.newRelationship(NS_PAR, 'OrgAdmin', 'admin@pes1');
    pesqueira.usuarios = [];
    await rexistroPesqueira.add(pesqueira);
    

    var rexistroEmpresa = await getAssetRegistry(NS_ORG + '.Empresa');
    var empresa1 = factory.newResource(NS_ORG, 'Empresa','org1');
    empresa1.administrador = factory.newRelationship(NS_PAR, 'OrgAdmin', 'admin@org1');
    empresa1.usuarios = [];

    var empresa2 = factory.newResource(NS_ORG, 'Empresa','org2');
    empresa2.administrador = factory.newRelationship(NS_PAR, 'OrgAdmin', 'admin@org2');
    empresa2.usuarios = [];
    await rexistroEmpresa.addAll([empresa1, empresa2]);
    


    return getAssetRegistry(NS_PEIXE + '.Peixe')
    .then(function(rexistroPeixe) {
        peixes.forEach(function(peixe, index) {
            var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
            coordenadas.lonxitude = 3.14;
            coordenadas.latitude = -74.23;
            peixe.coordenadas = coordenadas;
            peixe.variedade = 'xurelo';
            peixe.dataCaptura = new Date();
            peixe.pesqueira = factory.newRelationship(NS_ORG, 'Pesqueira', 'pes1');
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