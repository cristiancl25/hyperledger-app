
/**
 *
 * @param {org.hyperledger.composer.organizaciones.CrearOrganizacion} datos
 * @transaction
 */
async function CrearOrganizacion(datos){
    var factory = getFactory();

    /* TODO mejorar el control de acceso: NetworkAdmin */
    if (getCurrentParticipant().$namespace !== 'org.hyperledger.composer.system'){
        throw new Error('participante inválido');
    }

    /* Creación del administrador para la organización */
    var admin = factory.newResource(NS_PAR, 'OrgAdmin', datos.emailAdmin);
    admin.nombre = datos.nombreAdmin;
    admin.orgId = datos.orgId;

    var regPar = await getParticipantRegistry(NS_PAR + '.OrgAdmin');
    regPar.add(admin);

    /* Creación de la organización */
    var org = factory.newResource(NS_ORG, 'Organizacion', datos.orgId);
    org.tipoOrganizacion = datos.tipoOrganizacion;
    org.descripcion = datos.descripcion;
    org.fechaCreacion = new Date();
    org.usuarios = [];
    org.administrador = admin;
    var regOrg = await getAssetRegistry(NS_ORG + '.Organizacion');
    await regOrg.add(org);
}