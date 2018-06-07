
/**
 *
 * @param {org.hyperledger.composer.participantes.CrearParticipante} datos
 * @transaction
 */
async function CrearParticipante(datos){
    // TODO ampliar para añadir participantes del tipo Usuario e Invitado
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
    admin.usuarios.push(factory.newRelationship(NS_PAR, 'Usuario', usuario.email));
    await regOrg.update(admin);
}