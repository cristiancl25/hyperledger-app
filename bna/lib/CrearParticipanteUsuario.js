/**
 *
 * @param {org.peixeencadeado.participantes.CrearParticipanteUsuario} datos
 * @transaction
 */
async function CrearParticipanteUsuario(datos){
    const NS_PAR = 'org.peixeencadeado.participantes';
    const NS_ORG = 'org.peixeencadeado.organizacions';
    const factory = getFactory();
    const participanteActual = getCurrentParticipant();

    if (participanteActual.$type !== 'OrgAdmin'){
        throw new Error('participante non válido');
    }

    var rexistroPar = await getParticipantRegistry(NS_PAR + '.Usuario');
    var usuario = factory.newResource(NS_PAR, 'Usuario', datos.email);
    usuario.nome = datos.nome;
    usuario.orgId = participanteActual.orgId;
    await rexistroPar.add(usuario);

    // Insercción do novo usuario na lista de participantes válidos da organización
    var rexistroOrg = await getAssetRegistry(NS_ORG + '.Organizacion');
    var admin = await rexistroOrg.get(participanteActual.orgId);
    admin.usuarios.push(usuario);
    await rexistroOrg.update(admin);
}