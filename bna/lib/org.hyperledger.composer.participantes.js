
/**
 *
 * @param {org.hyperledger.composer.participantes.CrearParticipante} datos
 * @transaction
 */
async function CrearParticipante(datos){
    const factory = getFactory();
    const participanteActual = getCurrentParticipant();
    var tipo = ''; 
    var lista = [];

    if (participanteActual.$type !== 'OrgAdmin'){
        throw new Error('participante inválido');
    }

    var regOrg = await getAssetRegistry(NS_ORG + '.Organizacion');
    var org = await regOrg.get(participanteActual.orgId);

    // TODO validar usuario OrgAdmin
    if (datos.tipoUsuario === 'Usuario'){
       tipo = 'Usuario'; 
       lista = org.usuarios;
    } else if (datos.tipoUsuario === 'Invitado'){
       tipo = 'Invitado'; 
       lista = org.invitados
    } else {
        throw new Error('El tipo de participante especificado (' + datos.tipoUsuario + ') no existe');
    }

    var regPar = await getParticipantRegistry(NS_PAR + '.' + tipo);
    var usuario = factory.newResource(NS_PAR, tipo, datos.id);
    usuario.email = datos.email;
    usuario.nombre = datos.nombre;
    usuario.orgId = participanteActual.orgId;
    await regPar.add(usuario);

    // Inserción del nuevo participante en la lista de participantes válido de la organización
    lista.push(factory.newRelationship(NS_PAR, tipo, datos.id));
    await regOrg.update(org);
}

/**
 *
 * @param {org.hyperledger.composer.participantes.ActualizarParticipante} datos
 * @transaction
 */
async function ActualizarParticipante(datos){
    const participanteActual = getCurrentParticipant();
    const tipo = participanteActual.$type;
    const id = participanteActual.$identifier;

    var regPar = await getParticipantRegistry(NS_PAR + '.' + tipo);
    var usuario = await regPar.get(id);

    if (datos.email){
        usuario.email = datos.email;
    }

    if (datos.nombre){
        usuario.nombre = datos.nombre;
    }

    await regPar.update(usuario);
}


/**
 *
 * @param {org.hyperledger.composer.participantes.EliminarParticipante} datos
 * @transaction
 */
async function EliminarParticipante(datos){
    const participanteActual = getCurrentParticipant();
    var regOrg = await getAssetRegistry(NS_ORG + '.Organizacion');
    var org = await regOrg.get(participanteActual.orgId);

    var lista = [];
    
    var tipo;
    if (datos.tipoUsuario == 'Usuario'){
        lista = org.usuarios;
        tipo = 'Usuario';
    } else if (datos.tipoUsuario == 'Invitado'){
        lista = org.invitados;
        tipo = 'Invitado';
    } else {
        throw new Error ('El tipo de usuario especificado no es válido');
    }
    const index = lista.findIndex((user) => {
        return user.$identifier === datos.id;
    });
    
    if (index === -1) {
        throw new Error('El participante especificado no existe');
    }
    lista.splice(index, 1);

    await regOrg.update(org);

    var regPar = await getParticipantRegistry(NS_PAR + '.' + tipo);
    var usuario = await regPar.get(datos.id);
    await regPar.remove(usuario);
}