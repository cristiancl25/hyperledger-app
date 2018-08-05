
// Devuelve el registro y la organización a la que pertenece un participante del tipo OrgAdmin
async function getOrganizacion(participante){
    try{
        var regOrg = await getAssetRegistry(NS_ORG + '.Organizacion');
        var organizacion = await regOrg.get(participante.orgId);
    }catch(error){
        throw new Error('El usuario' + participante.getFullyQualifiedIdentifier() + 
                ' pertenece a unha organizacion no válida ( ' +  participante.orgId + ' )');
    }

    if (participante.email !== organizacion.administrador.$identifier){
        throw new Error('El participante ' + participante.email + ' no pertenece a la organizacion ' + participante.orgId);
    }
    
    return {organizacion, regOrg};
}


/**
 *
 * @param {org.hyperledger.composer.organizaciones.CrearOrganizacion} datos
 * @transaction
 */
async function CrearOrganizacion(datos){
    var factory = getFactory();

    var regTipoOrg = await getAssetRegistry(NS_ORG + '.TipoOrganizacion');
    if (! await regTipoOrg.exists(datos.tipoOrganizacion)){
        throw new Error('El tipo de organización ' + datos.tipoOrganizacion + ' no existe');
    }

    /* Creación del administrador para la organización */
    var admin = factory.newResource(NS_PAR, 'OrgAdmin', datos.idAdmin);
    admin.email = datos.emailAdmin;
    admin.nombre = datos.nombreAdmin;
    admin.orgId = datos.orgId;

    var regPar = await getParticipantRegistry(NS_PAR + '.OrgAdmin');
    regPar.add(admin);

    /* Creación de la organización */
    var org = factory.newResource(NS_ORG, 'Organizacion', datos.orgId);
    org.tipoOrganizacion = factory.newRelationship(NS_ORG, 'TipoOrganizacion', datos.tipoOrganizacion);
    org.descripcion = datos.descripcion;
    org.nombre = datos.nombre;
    org.fechaCreacion = new Date();
    org.usuarios = [];
    org.invitados = [];
    org.localizaciones = [];
    org.email = datos.email;
    org.telefono = datos.telefono;
    org.webUrl = datos.webUrl;
    org.administrador = factory.newRelationship(NS_PAR, 'OrgAdmin', admin.email);
    var regOrg = await getAssetRegistry(NS_ORG + '.Organizacion');
    await regOrg.add(org);
}

/**
 *
 * @param {org.hyperledger.composer.organizaciones.CrearTipoOrganizacion} datos
 * @transaction
 */
async function CrearTipoOrganizacion(datos){
    var factory = getFactory();

    var tipoOrg = factory.newResource(NS_ORG, 'TipoOrganizacion', datos.tipo);
    var regOrg = await getAssetRegistry(NS_ORG + '.TipoOrganizacion');
    await regOrg.add(tipoOrg);
}


/**
 *
 * @param {org.hyperledger.composer.organizaciones.CrearLocalizacion} datos
 * @transaction
 */
async function CrearLocalizacion(datos) {
    var factory = getFactory();
    var participante = getCurrentParticipant();
    var {organizacion, regOrg} = await getOrganizacion(participante);
    const locId = participante.orgId + '-' + datos.nombre.trim().replace(/ /g,'-');

    var loc = factory.newResource(NS_ORG, 'Localizacion', locId);
    loc.latitud = datos.latitud;
    loc.longitud = datos.longitud;
    loc.direccion = datos.direccion;
    var regLoc = await getAssetRegistry(NS_ORG + '.Localizacion');
    await regLoc.add(loc);

    organizacion.localizaciones.push(factory.newRelationship(NS_ORG, 'Localizacion', locId));
    await regOrg.update(organizacion);
}


/**
 *
 * @param {org.hyperledger.composer.organizaciones.EliminarLocalizacion} datos
 * @transaction
 */
async function EliminarLocalizacion(datos) {
    var participante = getCurrentParticipant();
    var {organizacion, regOrg} = await getOrganizacion(participante);
    const index = organizacion.localizaciones.findIndex((loc) => loc.$identifier === datos.localizacionId);
    if (index === -1) {
        throw new Error('La localización especificada no existe');
    }

    organizacion.localizaciones.splice(index, 1);


    await regOrg.update(organizacion);
}


/**
 *
 * @param {org.hyperledger.composer.organizaciones.ActualizarOrganizacion} datos
 * @transaction
 */
async function ActualizarOrganizacion(datos){
    var participante = getCurrentParticipant();
    var {organizacion, regOrg} = await getOrganizacion(participante);

    if (datos.nombre) {
        organizacion.nombre = datos.nombre;
    }

    if (datos.descripcion) {
        organizacion.descripcion = datos.descripcion;
    }

    if (datos.email) {
        organizacion.email = datos.email;
    }

    if (datos.telefono) {
        organizacion.telefono = datos.telefono;
    }

    if (datos.webUrl) {
        organizacion.webUrl = datos.webUrl;
    }

    await regOrg.update(organizacion);
}