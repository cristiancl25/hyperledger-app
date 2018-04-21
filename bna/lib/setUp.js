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
        factory.newResource(NS_PAR, 'Usuario', 'participante1@org2'),
        factory.newResource(NS_PAR, 'Usuario', 'participante2@pes1')
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
    participantes[0].orgId = participantes[0].email.split('@')[1];

    participantes[1].nome = 'participante1';
    participantes[1].orgId = participantes[1].email.split('@')[1];

    participantes[2].nome = 'participante1';
    participantes[2].orgId = participantes[2].email.split('@')[1];

    participantes[3].nome = 'participante2';
    participantes[3].orgId = participantes[3].email.split('@')[1];
    await rexistroParticipante.addAll(participantes);

    var rexistroAdmins = await getParticipantRegistry(NS_PAR + '.OrgAdmin');
    admins[0].nome = 'admin1';
    admins[0].orgId = admins[0].email.split('@')[1];

    admins[1].nome = 'admin1';
    admins[1].orgId = admins[1].email.split('@')[1];

    admins[2].nome = 'admin1';
    admins[2].orgId = admins[2].email.split('@')[1];
    await rexistroAdmins.addAll(admins);

    var rexistroOrganizacion = await getAssetRegistry(NS_ORG + '.Organizacion');
    var pesqueira = factory.newResource(NS_ORG, 'Organizacion','pes1');
    pesqueira.administrador = factory.newRelationship(NS_PAR, 'OrgAdmin', 'admin@pes1');
    pesqueira.descripcion = 'descripcion';
    pesqueira.tipoOrganizacion = 'tipo';
    pesqueira.usuarios = [factory.newRelationship(NS_PAR, 'Usuario', 'participante1@pes1')];    

    var empresa1 = factory.newResource(NS_ORG, 'Organizacion','org1');
    empresa1.descripcion = 'descripcion';
    empresa1.tipoOrganizacion = 'tipo';
    empresa1.administrador = factory.newRelationship(NS_PAR, 'OrgAdmin', 'admin@org1');
    empresa1.usuarios = [factory.newRelationship(NS_PAR, 'Usuario', 'participante1@org1')];

    var empresa2 = factory.newResource(NS_ORG, 'Organizacion','org2');
    empresa2.descripcion = 'descripcion';
    empresa2.tipoOrganizacion = 'tipo';
    empresa2.administrador = factory.newRelationship(NS_PAR, 'OrgAdmin', 'admin@org2');
    empresa2.usuarios = [factory.newRelationship(NS_PAR, 'Usuario', 'participante1@org2')];
    await rexistroOrganizacion.addAll([pesqueira, empresa1, empresa2]);

    return getAssetRegistry(NS_PEIXE + '.Peixe')
    .then(function(rexistroPeixe) {
        peixes.forEach(function(peixe, index) {
            var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
            coordenadas.lonxitude = 3.14;
            coordenadas.latitude = -74.23;

            var caracteristicas = factory.newConcept(NS_PEIXE,'Caracteristicas');
            caracteristicas.variedade = 'Xurelo'
            caracteristicas.peso = 1.1;

            var operacion = factory.newConcept(NS_PEIXE,'Operacion');
            operacion.captura = true;
            operacion.coordenadas = coordenadas;
            operacion.descripcion = 'Sin descripción';
            operacion.fecha = new Date();
            operacion.organizacion = factory.newRelationship(NS_ORG, 'Organizacion', 'pes1');
    
            peixe.caracteristicas = caracteristicas;
            peixe.operacionActual = operacion;
            peixe.operacions = [];
            peixe.estado = 'CAPTURADO';
        });
        return rexistroPeixe.addAll(peixes);
    })
    .catch(function(error){
        throw new Error(error);
    });
}