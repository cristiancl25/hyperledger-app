/**
 *
 * @param {org.peixeencadeado.organizacions.CrearOrganizacion} datos
 * @transaction
 */
async function CrearOrganizacion(datos){
    const NS_ORG = 'org.peixeencadeado.organizacions';
    const NS_PAR = 'org.peixeencadeado.participantes';
    var factory = getFactory();

    /* TODO mellorar o control de acceso: NetworkAdmin */
    if (getCurrentParticipant().$namespace !== 'org.hyperledger.composer.system'){
        throw new Error('participante non válido');
    }

    var admin = factory.newResource(NS_PAR, 'OrgAdmin', datos.emailAdmin);
    admin.nome = datos.nomeAdmin;
    admin.orgId = datos.orgId;

    var rexistroPar = await getParticipantRegistry(NS_PAR + '.OrgAdmin');
    rexistroPar.add(admin);

    var org = factory.newResource(NS_ORG, 'Organizacion', datos.orgId);
    org.tipoOrganizacion = datos.tipoOrganizacion;
    org.descripcion = datos.descripcion;
    org.fechaCreacion = new Date();
    org.usuarios = [];
    org.administrador = admin;
    var rexistroOrg = await getAssetRegistry(NS_ORG + '.Organizacion');
    await rexistroOrg.add(org);
}