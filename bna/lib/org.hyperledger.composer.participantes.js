
/**
 *
 * @param {org.hyperledger.composer.participantes.CrearParticipanteUsuario} datos
 * @transaction
 */
async function CrearParticipanteUsuario(datos){
    const factory = getFactory();
    const participanteActual = getCurrentParticipant();

    if (participanteActual.$type !== 'OrgAdmin'){
        throw new Error('participante inválido');
    }

    var regPar = await getParticipantRegistry(NS_PAR + '.Usuario');
    var usuario = factory.newResource(NS_PAR, 'Usuario', datos.email);
    usuario.nombre = datos.nombre;
    usuario.orgId = participanteActual.orgId;
    await regPar.add(usuario);

    // Inserción del nuevo participante en la lista de participantes válido de la organización
    var regOrg = await getAssetRegistry(NS_ORG + '.Organizacion');
    var admin = await regOrg.get(participanteActual.orgId);
    admin.usuarios.push(usuario);
    await regOrg.update(admin);
}