/**
 *
 * @param {org.peixeencadeado.participantes.CrearParticipanteUsuario} datos
 * @transaction
 */
async function CrearParticipanteUsuario(datos){
    const NS_PAR = 'org.peixeencadeado.participantes';
    const factory = getFactory();
    var rexistroPar = await getParticipantRegistry(NS_PAR + '.Usuario');
    var usuario = factory.newResource(NS_PAR, 'Usuario', datos.email);
    usuario.nome = datos.nome;
    await rexistroPar.add(usuario);
}