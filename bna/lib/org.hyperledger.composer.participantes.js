
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
    var usuario = factory.newResource(NS_PAR, tipo, datos.email);
    usuario.nombre = datos.nombre;
    usuario.orgId = participanteActual.orgId;
    await regPar.add(usuario);

    // Inserción del nuevo participante en la lista de participantes válido de la organización
    lista.push(factory.newRelationship(NS_PAR, tipo, usuario.email));
    await regOrg.update(org);
}