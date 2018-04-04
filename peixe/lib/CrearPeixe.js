/**
 *
 * @param {org.peixeencadeado.peixe.CrearPeixe} datos
 * @transaction
 */
 async function crearPeixe(datos){
    const NS_ORG = 'org.peixeencadeado.organizacions'
    const NS_PEIXE = 'org.peixeencadeado.peixe';
    var participante = getCurrentParticipant();
    validarParticipante(NS_ORG, participante);
    const factory = getFactory();
    const peixeId = xerarPeixeId(participante.orgId);
    var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
    var peixe = factory.newResource(NS_PEIXE, 'Peixe', peixeId);

    var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
    coordenadas.lonxitude = datos.lonxitude;
    coordenadas.latitude = datos.latitude;

    var caracteristicas = factory.newConcept(NS_PEIXE,'Caracteristicas');
    caracteristicas.variedade = datos.variedade
    caracteristicas.peso = datos.peso;

    var operacion = factory.newConcept(NS_PEIXE,'Operacion');
    operacion.captura = true;
    operacion.coordenadas = coordenadas;
    operacion.descripcion = datos.descripcion;
    operacion.fecha = new Date();
    operacion.organizacion = factory.newRelationship(NS_ORG, 'Organizacion', participante.orgId);
    
    peixe.caracteristicas = caracteristicas;
    peixe.operacionActual = operacion;
    peixe.operacions = [];
    peixe.estado = 'CAPTURADO';
    var rexistroPeixe = await getAssetRegistry(NS_PEIXE + '.Peixe');
    await rexistroPeixe.add(peixe);

    var evento = factory.newEvent(NS_PEIXE, 'PeixeCreado');
    evento.peixeId = peixeId;
    evento.orgId = participante.orgId;
    evento.variedade = datos.variedade
    emit(evento);
}

async function validarParticipante(NS_ORG, participante){
    return getAssetRegistry(NS_ORG + '.Organizacion')
    .then(function(rexistro){
        return rexistro.get(participante.orgId);
    }).then(function(organizacion){
        var find = false;
        organizacion.usuarios.forEach(function(usuario){
            if (participante.email === usuario['$identifier']){
                find = true;
                return;
            }
        });
        if (!find){
            console.log('non encontrado');
            throw new Error('Participante non encontrado');
        }
    });

}

function xerarPeixeId(orgId){
    return orgId + '-' + new Date().toJSON();
}