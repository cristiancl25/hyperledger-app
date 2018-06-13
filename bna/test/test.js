'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

const NS_PAR = 'org.hyperledger.composer.participantes';
const NS_PROD = 'org.hyperledger.composer.productos';
const NS_ORG = 'org.hyperledger.composer.organizaciones';

describe('Sample', () => {
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded'
    };
    const adminCardName = 'admin';
    let adminConnection;
    let businessNetworkConnection;
    let factory;
    let events;
    let businessNetworkName;

    before(async () => {
        const credentials = CertificateUtil.generate({ commonName: 'admin' });

        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);
        const deployerCardName = 'PeerAdmin';

        adminConnection = new AdminConnection({ cardStore: cardStore });

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    async function importCardForIdentity(cardName, identity) {
        const metadata = {
            userName: identity.userID,
            version: 1,
            enrollmentSecret: identity.userSecret,
            businessNetwork: businessNetworkName
        };
        const card = new IdCard(metadata, connectionProfile);
        await adminConnection.importCard(cardName, card);
    }

    beforeEach(async () => {
        let businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
        businessNetworkName = businessNetworkDefinition.getName();
        await adminConnection.install(businessNetworkDefinition);
        const startOptions = {
            networkAdmins: [
                {
                    userName: 'admin',
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkName, businessNetworkDefinition.getVersion(), startOptions);
        await adminConnection.importCard(adminCardName, adminCards.get('admin'));

        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
        events = [];
        businessNetworkConnection.on('event', event => {
            events.push(event);
        });
        await businessNetworkConnection.connect(adminCardName);

        factory = businessNetworkConnection.getBusinessNetwork().getFactory();
    });

    async function useIdentity(cardName) {
        await businessNetworkConnection.disconnect();
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
        events = [];
        businessNetworkConnection.on('event', (event) => {
            events.push(event);
        });
        await businessNetworkConnection.connect(cardName);
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();
    }

    async function getProducto(productoId){
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        return await regProducto.get(productoId);
    }

    async function getPuja(id){
        var reg = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Puja');
        return await reg.get(id);
    }

    async function getTransaccion(id){
        var reg = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        return await reg.get(id);
    }

    async function crearLocalizacion(loc){
        const transaction = factory.newTransaction(NS_ORG, 'CrearLocalizacion');
        transaction.nombre = loc.nombre;
        transaction.latitud = loc.latitud;
        transaction.longitud = loc.longitud;
        transaction.direccion = loc.direccion;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function crearTipoProducto(tipo){
        const transaction = factory.newTransaction(NS_PROD, 'CrearTipoProducto');
        transaction.tipo = tipo;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function crearTipoOrganizacion(tipo){
        const transaction = factory.newTransaction(NS_ORG, 'CrearTipoOrganizacion');
        transaction.tipo = tipo;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function crearParticipante(email, nombre, tipoUsuario) {
        const transaction = factory.newTransaction(NS_PAR, 'CrearParticipante');

        transaction.email = email;
        transaction.nombre = nombre;
        transaction.tipoUsuario = tipoUsuario;
        await businessNetworkConnection.submitTransaction(transaction);
        await importCardForIdentity(email, await businessNetworkConnection.issueIdentity(NS_PAR + '.' + tipoUsuario + '#' + email, email));
    }

    async function crearOrganizacion(orgId, tipoOrganizacion, descripcion, nombreAdmin, emailAdmin){
        const transaction = factory.newTransaction(NS_ORG, 'CrearOrganizacion');

        transaction.orgId = orgId;
        transaction.tipoOrganizacion = tipoOrganizacion;
        transaction.descripcion = descripcion;
        transaction.nombreAdmin = nombreAdmin;
        transaction.emailAdmin = emailAdmin;
        await businessNetworkConnection.submitTransaction(transaction);
        await importCardForIdentity(emailAdmin, await businessNetworkConnection.issueIdentity(NS_PAR + '.OrgAdmin#' + emailAdmin, emailAdmin, {issuer:true}));
    }

    async function crearOrganizacionyUsuario(orgId, orgTipo, admin, usuario){
        await useIdentity('admin');
        await crearTipoOrganizacion(orgTipo);
        await crearOrganizacion(orgId, orgTipo, 'descripción', admin, admin + '@' + orgId);
        await useIdentity(admin + '@' + orgId);
        await crearParticipante(usuario + '@' + orgId, usuario, 'Usuario');
        await crearLocalizacion({
            "nombre" : "loc1",
            "latitud" : 1.2,
            "longitud" : 1.8,
            "direccion" : "Dirección de ejemplo" 
        });
    }

    async function crearProducto(identificador, c, localizacionId, localizacion, imagen){
        var caracteristicas = factory.newConcept(NS_PROD, 'Caracteristicas');
        caracteristicas.tipoProducto = factory.newRelationship(NS_PROD, 'TipoProducto', c.tipoProducto);
        caracteristicas.variedadProducto = c.variedadProducto;
        caracteristicas.descripcion = c.descripcion;
        caracteristicas.tipo = c.tipo;
        caracteristicas.unidades = c.unidades;
        caracteristicas.peso = c.peso;
        caracteristicas.magnitudPeso = c.magnitudPeso;

        let transaction = factory.newTransaction(NS_PROD, 'CrearProducto');
        if (localizacion){ 
            var loc = factory.newConcept(NS_PROD, 'Loc');
            loc.latitud = localizacion.latitud;
            loc.longitud = localizacion.longitud;
            loc.direccion = localizacion.direccion;
            transaction.loc = loc;
        } else {
            transaction.localizacionId = localizacionId;
        }
        transaction.identificador = identificador;
        transaction.caracteristicas = caracteristicas;
        if (imagen){
            transaction.imagen = imagen;
        }
        
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function crearProductoEjemplo(){
        await crearProducto('producto1',{
                "tipoProducto" : "PESCADO",
                "variedadProducto" : "sardina",
                "descripcion" : "Descripción del producto", 
                "tipo" : "UNIDAD",
                "unidades" : 1,
                "peso" : 0.3,
                "magnitudPeso" : 'kg'
            }, undefined, {
                "latitud" : 1.3,
                "longitud" : 2.5,
                "direccion" : "dirección de prueba"
            }, 
            undefined);
        // TODO sacar events
        const regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var productos = await regProd.getAll();
        return productos[productos.length - 1].productoId;
        //return events[events.length - 1].productoId;
    }

    async function comprarProducto(productoId){
        let transaction = factory.newTransaction(NS_PROD, 'ComprarProducto');
        transaction.productoId = productoId;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function ponerVentaProducto(productoId, tipoVenta, unidadMonetaria, precio){
        let transaction = factory.newTransaction(NS_PROD, 'PonerVentaProducto');
        transaction.productoId = productoId;
        transaction.tipoVenta = tipoVenta;
        transaction.unidadMonetaria = unidadMonetaria;
        transaction.precio = precio;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function pujarProducto(productoId, precio){
        let transaction = factory.newTransaction(NS_PROD, 'PujarProducto');
        transaction.productoId = productoId;
        transaction.precio = precio;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function finalizarPuja(productoId){
        let transaction = factory.newTransaction(NS_PROD, 'FinalizarPuja');
        transaction.productoId = productoId;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function confirmarTransaccion(productoId, confirmar, localizacionId){
        let transaction = factory.newTransaction(NS_PROD, 'ConfirmarTransaccion');
        transaction.productoId = productoId;
        transaction.confirmar = confirmar;
        if (localizacionId) {
            transaction.nuevaLocalizacion = localizacionId;
        }
        await businessNetworkConnection.submitTransaction(transaction);
    }


    async function dividirProducto(productoId, t){
        var trozos = [];
        var unidad = false; 

        for (var i = 0; i < t.length; i++) {
            let imagen = factory.newConcept(NS_PROD, 'Imagen');
            let trozo = factory.newConcept(NS_PROD, 'Trozo');
            trozo.unidades = t[i].unidades;
            trozo.peso = t[i].peso;
            trozo.identificador = t[i].identificador;
            if (t[i].imagen){
                imagen.hashImagen = t[i].imagen.hashImagen;
                imagen.url = t[i].imagen.url;
                imagen.algoritmo = t[i].imagen.algoritmo;
                trozo.imagen = imagen;
            }
            trozos.push(trozo);
        }
        const transaction = factory.newTransaction(NS_PROD, 'DividirProducto');
        transaction.productoId = productoId;
        transaction.trozos = trozos;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function cancelarVenta(productoId){
        let transaction = factory.newTransaction(NS_PROD, 'CancelarVenta');
        transaction.productoId = productoId;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function consumirProducto(productoId){
        let transaction = factory.newTransaction(NS_PROD, 'ConsumirProducto');
        transaction.productoId = productoId;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function productoPerdido(productoId){
        let transaction = factory.newTransaction(NS_PROD, 'ProductoPerdido');
        transaction.productoId = productoId;
        await businessNetworkConnection.submitTransaction(transaction);
    }




    it('Creación de un tipo de producto', async () => {
        //TODO Ajustar identidades
        await useIdentity('admin');
        await crearTipoProducto('NUEVO_TIPO_PRODUCTO'); 
        var regTipoProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.TipoProducto');
        var tipoProd = await regTipoProd.getAll();
        tipoProd.should.have.lengthOf(1);
        tipoProd[0].tipo.should.equal('NUEVO_TIPO_PRODUCTO');
    });


    it('Creación de un tipo de organización', async () => {
        await useIdentity('admin');
        await crearTipoOrganizacion('PESQUEIRA');
        var regTipoOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.TipoOrganizacion');
        chai.assert.isTrue(await regTipoOrg.exists('PESQUEIRA'));
    });


    // TODO crear más test de las organizaciones
    it('Creación de una organización y de su administrador', async () => {
        await useIdentity('admin');
        await crearTipoOrganizacion('LONXA');
        await crearOrganizacion('OrganizacionProba', 'LONXA', 'descripción', 'admin', 'admin@OrganizacionProba');

        const regOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Organizacion');
        var orgs = await regOrg.getAll();
        orgs.should.have.lengthOf(1);
        var org = await regOrg.get('OrganizacionProba');
        org.orgId.should.equal('OrganizacionProba');
        org.tipoOrganizacion.$identifier.should.equal('LONXA');
        org.administrador.$identifier.should.equal('admin@OrganizacionProba');
        org.descripcion.should.equal('descripción');
        chai.expect(org.usuarios).to.eql([]);
        chai.expect(org.localizaciones).to.eql([]);

        const regPar = await businessNetworkConnection.getParticipantRegistry(NS_PAR + '.OrgAdmin');
        const par = await regPar.get('admin@OrganizacionProba');
        par.email.should.equal('admin@OrganizacionProba');
        par.nombre.should.equal('admin');

    });
    

    // TODO Crear más tests con las localizaciones
    it('Creación de una localización', async () => {
        const localizacionId = 'pes1-Dirección-1';
        await useIdentity('admin');
        await crearTipoOrganizacion('LONXA');
        await crearOrganizacion('pes1', 'LONXA', 'descripcion', 'admin', 'admin@pes1');
        await useIdentity('admin@pes1');
        const addr = "Dirección de prueba";
        await crearLocalizacion({
            "nombre" : "  Dirección 1  ",
            "latitud" : 1.2,
            "longitud" : 1.8,
            "direccion" : addr
        });
        
        var regLoc = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Localizacion');
        var locs = await regLoc.getAll();
        locs.should.have.lengthOf(1);
        locs[0].localizacionId.should.equal(localizacionId);
        locs[0].latitud.should.equal(1.2);
        locs[0].longitud.should.equal(1.8);
        locs[0].direccion.should.equal(addr);

        var regOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Organizacion');
        var orgs = await regOrg.getAll();
        orgs.should.have.lengthOf(1);
        orgs[0].localizaciones.should.have.lengthOf(1);
        orgs[0].localizaciones[0].$identifier.should.equal(localizacionId);
    });
    

    it('Creación de un participante Usuario para una organización', async () => {
        const orgTipo = 'LONXA'; const admin = 'admin'; const orgId = 'test'; const usuario = 'usuario1';
        await useIdentity('admin');
        await crearTipoOrganizacion(orgTipo);
        await crearOrganizacion(orgId, orgTipo, 'descripción', admin, admin + '@' + orgId);
        await useIdentity(admin + '@' + orgId);
        
        await crearParticipante(usuario + '@' + orgId, usuario, 'Usuario');

        const reg = await businessNetworkConnection.getParticipantRegistry(NS_PAR + '.Usuario');
        var users = await reg.getAll();
        users.should.have.lengthOf(1);
        users[0].email.should.equal('usuario1@test');
        users[0].nombre.should.equal('usuario1');
        users[0].orgId.should.equal('test');

        const regOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Organizacion');
        var org = await regOrg.get('test');
        org.orgId.should.equal('test');
        org.tipoOrganizacion.$identifier.should.equal('LONXA');
        org.administrador.$identifier.should.equal('admin@test');
        org.descripcion.should.equal('descripción');
        org.usuarios.should.have.lengthOf(1);
        org.usuarios[0].$identifier.should.equal('usuario1@test');
        org.localizaciones.should.have.lengthOf(0);
        org.invitados.should.have.lengthOf(0);

        await crearParticipante('usuario2' + '@' + orgId, 'usuario2', 'Usuario');

        users = await reg.getAll();
        users.should.have.lengthOf(2);
        users[1].email.should.equal('usuario2@test');
        users[1].nombre.should.equal('usuario2');
        users[1].orgId.should.equal('test');

        org = await regOrg.get('test');
        org.orgId.should.equal('test');
        org.tipoOrganizacion.$identifier.should.equal('LONXA');
        org.administrador.$identifier.should.equal('admin@test');
        org.descripcion.should.equal('descripción');
        org.usuarios.should.have.lengthOf(2);
        org.usuarios[1].$identifier.should.equal('usuario2@test');
        org.localizaciones.should.have.lengthOf(0);
        org.invitados.should.have.lengthOf(0);
    });


    it('Creación de un participante Invitado para una organización', async () => {
        const orgTipo = 'LONXA'; const admin = 'admin'; const orgId = 'test'; const usuario = 'invitado1';
        await useIdentity('admin');
        await crearTipoOrganizacion(orgTipo);
        await crearOrganizacion(orgId, orgTipo, 'descripción', admin, admin + '@' + orgId);
        await useIdentity(admin + '@' + orgId);
        
        await crearParticipante(usuario + '@' + orgId, usuario, 'Invitado');

        const reg = await businessNetworkConnection.getParticipantRegistry(NS_PAR + '.Invitado');
        var users = await reg.getAll();
        users.should.have.lengthOf(1);
        users[0].email.should.equal('invitado1@test');
        users[0].nombre.should.equal('invitado1');
        users[0].orgId.should.equal('test');

        const regOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Organizacion');
        var org = await regOrg.get('test');
        org.orgId.should.equal('test');
        org.tipoOrganizacion.$identifier.should.equal('LONXA');
        org.administrador.$identifier.should.equal('admin@test');
        org.descripcion.should.equal('descripción');
        org.invitados.should.have.lengthOf(1);
        org.invitados[0].$identifier.should.equal('invitado1@test');
        org.localizaciones.should.have.lengthOf(0);
        org.usuarios.should.have.lengthOf(0);

        await crearParticipante('invitado2' + '@' + orgId, 'invitado2', 'Invitado');

        users = await reg.getAll();
        users.should.have.lengthOf(2);
        users[1].email.should.equal('invitado2@test');
        users[1].nombre.should.equal('invitado2');
        users[1].orgId.should.equal('test');

        org = await regOrg.get('test');
        org.orgId.should.equal('test');
        org.tipoOrganizacion.$identifier.should.equal('LONXA');
        org.administrador.$identifier.should.equal('admin@test');
        org.descripcion.should.equal('descripción');
        org.invitados.should.have.lengthOf(2);
        org.invitados[1].$identifier.should.equal('invitado2@test');
        org.localizaciones.should.have.lengthOf(0);
        org.usuarios.should.have.lengthOf(0);
    });


    it('Creación de un participante INVÁLIDO para una organización', async () => {
        const orgTipo = 'LONXA'; const admin = 'admin'; const orgId = 'test'; const usuario = 'invitado1';
        await useIdentity('admin');
        await crearTipoOrganizacion(orgTipo);
        await crearOrganizacion(orgId, orgTipo, 'descripción', admin, admin + '@' + orgId);
        await useIdentity(admin + '@' + orgId);
        
        await chai.expect(
            crearParticipante(usuario + '@' + orgId, usuario, 'ERROR')
        ).to.be.rejectedWith(Error);

        const regI = await businessNetworkConnection.getParticipantRegistry(NS_PAR + '.Invitado');
        var users = await regI.getAll();
        users.should.have.lengthOf(0);

        const regU = await businessNetworkConnection.getParticipantRegistry(NS_PAR + '.Usuario');
        users = await regU.getAll();
        users.should.have.lengthOf(0);

        const regOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Organizacion');
        var org = await regOrg.get('test');
        org.orgId.should.equal('test');
        org.tipoOrganizacion.$identifier.should.equal('LONXA');
        org.administrador.$identifier.should.equal('admin@test');
        org.descripcion.should.equal('descripción');
        org.invitados.should.have.lengthOf(0);
        org.localizaciones.should.have.lengthOf(0);
        org.usuarios.should.have.lengthOf(0);
    });


    it('Creación de un producto por UNIDAD, con nueva localización', async () => {
        await useIdentity('admin');
        await crearTipoOrganizacion('LONXA');
        await crearOrganizacion('pes1', 'LONXA', 'descripcion', 'admin', 'admin@pes1');
        await useIdentity('admin@pes1');
        await crearParticipante('usuario1@pes1', 'usuario', 'Usuario');
        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        await crearProducto('producto1',{
                "tipoProducto" : "PESCADO",
                "variedadProducto" : "sardina",
                "descripcion" : "Descripción del producto", 
                "tipo" : "UNIDAD",
                "unidades" : 1,
                "peso" : 0.3,
                "magnitudPeso" : 'kg'
            }, undefined, {
                "latitud" : 1.3,
                "longitud" : 2.5,
                "direccion" : "dirección de prueba"
            }, 
            undefined);

        const regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var productos = await regProd.getAll();
        productos.should.have.lengthOf(1);

        var producto = productos[0];
        producto.identificador.should.equal('producto1');
        producto.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        producto.caracteristicas.variedadProducto.should.equal('sardina');
        producto.caracteristicas.descripcion.should.equal('Descripción del producto');
        producto.caracteristicas.tipo.should.equal('UNIDAD');
        producto.caracteristicas.unidades.should.equal(1);
        producto.caracteristicas.peso.should.equal(0.3);
        producto.caracteristicas.magnitudPeso.should.equal('kg');
        chai.expect(producto.imagen).to.be.undefined;
        chai.expect(producto.predecesor).to.be.undefined;
        chai.expect(producto.sucesores).to.be.undefined;
        chai.expect(producto.transaccionId).to.be.undefined;
        producto.estado.should.equal('PARADO');
        producto.operaciones.should.have.lengthOf(0);
        producto.operacionActual.orgId.should.equal('pes1');
        chai.expect(producto.operacionActual.datosVenta).to.be.undefined;
    });


    it('Creación de un producto por PESO, con nueva localización', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        await crearProducto('producto1',{
                "tipoProducto" : "PESCADO",
                "variedadProducto" : "sardina",
                "descripcion" : "Descripción del producto", 
                "tipo" : "PESO",
                "unidades" : 1,
                "peso" : 0.3,
                "magnitudPeso" : 'kg'
            }, 'pes1-loc1',
            undefined, 
            undefined);

        const regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var productos = await regProd.getAll();
        productos.should.have.lengthOf(1);

        var producto = productos[0];
        producto.identificador.should.equal('producto1');
        producto.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        producto.caracteristicas.variedadProducto.should.equal('sardina');
        producto.caracteristicas.descripcion.should.equal('Descripción del producto');
        producto.caracteristicas.tipo.should.equal('PESO');
        chai.expect(producto.caracteristicas.unidades).to.be.undefined;
        producto.caracteristicas.peso.should.equal(0.3);
        producto.caracteristicas.magnitudPeso.should.equal('kg');
        chai.expect(producto.imagen).to.be.undefined;
        producto.operacionActual.localizacion.$identifier.should.equal('pes1-loc1');
        chai.expect(producto.imagen).to.be.undefined;
        chai.expect(producto.predecesor).to.be.undefined;
        chai.expect(producto.sucesores).to.be.undefined;
        chai.expect(producto.transaccionId).to.be.undefined;
        producto.estado.should.equal('PARADO');
        producto.operaciones.should.have.lengthOf(0);
        producto.operacionActual.orgId.should.equal('pes1');
        chai.expect(producto.operacionActual.datosVenta).to.be.undefined;
    });


    it('Creación de un producto con tipo desconocido, con localizacion existente', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        await chai.expect(
            crearProducto('producto1',{
                    "tipoProducto" : "PESCADO",
                    "variedadProducto" : "sardina",
                    "descripcion" : "Descripción del producto", 
                    "tipo" : "PESOoooooo",
                    "unidades" : 1,
                    "peso" : 0.3,
                    "magnitudPeso" : 'kg'
                }, 'pes1-loc1',
                undefined, 
                undefined)
        ).to.be.rejectedWith(Error);
        await chai.expect(
            crearProducto('producto1',{
                    "tipoProducto" : "PESCADO",
                    "variedadProducto" : "sardina",
                    "descripcion" : "Descripción del producto", 
                    "tipo" : "PESO",
                    "unidades" : 1,
                    "peso" : 0.3,
                    "magnitudPeso" : 'kg'
                }, 'pes1-loc1111',
                undefined, 
                undefined)
        ).to.be.rejectedWith(Error);

        const regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var productos = await regProd.getAll();
        productos.should.have.lengthOf(0);
    });

    it('Creación de un producto con un participante NO válido', async () => {
        await useIdentity('admin');

        await chai.expect(
            crearProducto('producto1', 1.2, 12, 23, 'Descripción')
        ).to.be.rejectedWith(Error);
        const regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var productos = await regProd.getAll();
        productos.should.have.lengthOf(0);
    });

    it('Puesta en venta de un producto inexistente', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');

        await chai.expect(
            ponerVentaProducto('PRODUCTO_INEXISTENTE', 'NORMAL', '€', '13.4', undefined)
        ).to.be.rejectedWith(Error);
    });

    
    it('Puesta en venta (NORMAL) de un producto válido', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();

        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);
        const regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var producto = await regProd.get(productoId);
        producto.operacionActual.datosVenta.unidadMonetaria.should.equal('€');
        producto.operacionActual.datosVenta.precio.should.equal(13.4);
        producto.operacionActual.datosVenta.tipoVenta.should.equal('NORMAL');
        chai.expect(producto.operacionActual.datosVenta.pujaId).to.be.undefined;
        producto.estado.should.equal('VENTA');
    });


    it('Puesta en venta (PUJA) de un producto válido', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();

        await ponerVentaProducto(productoId, 'PUJA', '€', 13.4);

        const regPuja = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Puja');
        var pujas = await regPuja.getAll();
        pujas. should.have.lengthOf(1);
        pujas[0].precioPartida.should.equal(13.4);
        pujas[0].organizaciones.should.have.lengthOf(0);


        const regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var producto = await regProd.get(productoId);
        producto.operacionActual.datosVenta.unidadMonetaria.should.equal('€');
        producto.operacionActual.datosVenta.precio.should.equal(13.4);
        producto.operacionActual.datosVenta.pujaId.should.equal(pujas[0].pujaId);
        producto.operacionActual.datosVenta.tipoVenta.should.equal('PUJA');
        producto.estado.should.equal('PUJA');
    });


    it('Puja de un producto por la misma organización que lo vende', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();

        await ponerVentaProducto(productoId, 'PUJA', '€', 13.4);
        var producto = await getProducto(productoId);
        producto.estado.should.equal('PUJA');

        await chai.expect(
            pujarProducto(productoId, 13)
        ).to.be.rejectedWith(Error);
    });


    it('Puja de un producto por un precio inferior al de partida', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();

        await ponerVentaProducto(productoId, 'PUJA', '€', 13.4);

        await useIdentity('usuario1@res1');
        await chai.expect(
            pujarProducto(productoId, 13)
        ).to.be.rejectedWith(Error);
        (await getProducto(productoId)).estado.should.equal('PUJA');
    });

    it('Test de las transacción PujarProducto', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'R1', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res2', 'R2', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res3', 'R3', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();

        await ponerVentaProducto(productoId, 'PUJA', '€', 13.4);
        const pujaId = (await getProducto(productoId)).operacionActual.datosVenta.pujaId;

        await useIdentity('usuario1@res1');
        await pujarProducto(productoId, 14.1);
        var puja = await getPuja(pujaId);
        puja.organizaciones.should.have.lengthOf(1);
        puja.organizaciones[0].orgId.should.equal('res1');
        puja.organizaciones[0].precio.should.equal(14.1);
        await chai.expect(
            pujarProducto(productoId, 14.1)
        ).to.be.rejectedWith(Error);
        await pujarProducto(productoId, 15);
        puja = await getPuja(pujaId);
        puja.organizaciones.should.have.lengthOf(1);
        puja.organizaciones[0].orgId.should.equal('res1');
        puja.organizaciones[0].precio.should.equal(15);

        await useIdentity('usuario1@res2');
        await pujarProducto(productoId, 14);
        var puja = await getPuja(pujaId);
        puja.organizaciones.should.have.lengthOf(2);
        puja.organizaciones[1].orgId.should.equal('res2');
        puja.organizaciones[1].precio.should.equal(14);
        await chai.expect(
            pujarProducto(productoId, 13.5)
        ).to.be.rejectedWith(Error);
        await pujarProducto(productoId, 16);
        puja = await getPuja(pujaId);
        puja.organizaciones.should.have.lengthOf(2);
        puja.organizaciones[0].orgId.should.equal('res2');
        puja.organizaciones[0].precio.should.equal(16);

        await useIdentity('usuario1@res3');
        await pujarProducto(productoId, 15.5);
        var puja = await getPuja(pujaId);
        puja.organizaciones.should.have.lengthOf(3);
        puja.organizaciones[1].orgId.should.equal('res3');
        puja.organizaciones[1].precio.should.equal(15.5);
        await chai.expect(
            pujarProducto(productoId, 10)
        ).to.be.rejectedWith(Error);
        await chai.expect(
            pujarProducto(productoId, 14)
        ).to.be.rejectedWith(Error);
        await pujarProducto(productoId, 20);
        puja = await getPuja(pujaId);
        puja.organizaciones.should.have.lengthOf(3);
        puja.organizaciones[0].orgId.should.equal('res3');
        puja.organizaciones[0].precio.should.equal(20);
        (await getProducto(productoId)).estado.should.equal('PUJA');

    });


    it('Test de la transacción FinalizarPuja', async () => {
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var regPuja = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Puja');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'R1', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res2', 'R2', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res3', 'R3', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();

        await ponerVentaProducto(productoId, 'PUJA', '€', 13);
        var pujaId = (await getProducto(productoId)).operacionActual.datosVenta.pujaId;

        await useIdentity('usuario1@res1');
        await chai.expect(
            finalizarPuja(productoId)
        ).to.be.rejectedWith(Error);
        (await getProducto(productoId)).estado.should.equal('PUJA');

        await useIdentity('usuario1@pes1');
        var puja = await getPuja(pujaId);
        puja.organizaciones.should.have.length(0);
        await finalizarPuja(productoId);
        var producto = await getProducto(productoId);
        producto.estado.should.equal('PARADO');
        chai.expect(producto.operacionActual.datosVenta).to.be.undefined;

        await ponerVentaProducto(productoId, 'PUJA', '€', 13);
        (await getProducto(productoId)).estado.should.equal('PUJA');
        pujaId = (await getProducto(productoId)).operacionActual.datosVenta.pujaId;
        await useIdentity('usuario1@res1');
        await pujarProducto(productoId, 14);
        await useIdentity('usuario1@res2');
        await pujarProducto(productoId, 15);
        puja = await getPuja(pujaId);
        puja.organizaciones.should.have.lengthOf(2);
        (await regPuja.getAll()).should.have.lengthOf(2);
        await useIdentity('usuario1@pes1');
        await finalizarPuja(productoId);
        puja = await getPuja(pujaId);
        puja.organizaciones.should.have.lengthOf(1);
        producto = await getProducto(productoId);
        producto.estado.should.equal('TRANSACCION');
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion')
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].producto.$identifier.should.equal(productoId);
        transacciones[0].orgVenta.orgId.should.equal('pes1');
        transacciones[0].orgVenta.confirmacion.should.equal(false);
        transacciones[0].orgCompra.orgId.should.equal('res2');
        transacciones[0].orgCompra.confirmacion.should.equal(false);
        
        (await regProducto.getAll()).should.have.length(1);
    });


    it('Puesta en venta de un producto válido con un usuario de unha organización incorrecta', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('pes2', 'PESQUEIRA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();

        await useIdentity('usuario1@pes2');
        await chai.expect(
            ponerVentaProducto(productoId, 'NORMAL', '€', 13.4)
        ).to.be.rejectedWith(Error);
        const regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var producto = await regProd.get(productoId);
        producto.estado.should.equal('PARADO');
    });


    it('Compra de un producto válido', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);

        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion')
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].producto.$identifier.should.equal(productoId);
        transacciones[0].orgVenta.orgId.should.equal('pes1');
        transacciones[0].orgVenta.confirmacion.should.equal(false);
        transacciones[0].orgCompra.orgId.should.equal('res1');
        transacciones[0].orgCompra.confirmacion.should.equal(false);

        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto')
        var producto = await regProducto.get(productoId);
        producto.estado.should.equal('TRANSACCION');
        producto.transaccionId.should.equal(transacciones[0].transaccionId);

        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        (await regProducto.getAll()).should.have.length(1);
    });


    it('Compra de un producto por la misma organización que lo vende', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);

        await chai.expect(
            comprarProducto(productoId)
        ).to.be.rejectedWith(Error);
        
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(0);
        var regProd = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var producto = await regProd.get(productoId);
        producto.estado.should.equal('VENTA');
    });

    
    it('Rechazo de compra de un producto por la compañía compradora', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);

        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');

        await confirmarTransaccion(productoId, false, undefined);
        transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(0);

        var producto = await getProducto(productoId);
        producto.operacionActual.orgId.should.equal('pes1');
        producto.estado.should.equal('VENTA');
        chai.expect(producto.transaccionId).to.be.undefined;
    });


    it('Rechazo de compra de un producto por la compañía vendedora', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);

        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');

        await useIdentity('usuario1@pes1');
        await confirmarTransaccion(productoId, false, undefined);
        transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(0);

        var producto = await getProducto(productoId);
        producto.operacionActual.orgId.should.equal('pes1');
        producto.estado.should.equal('VENTA');
        chai.expect(producto.transaccionId).to.be.undefined;
    });


    it('Confirmación de compra de un producto por un participante de una compañía errónea', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res2', 'COMERCIO', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);
        (await getProducto(productoId)).estado.should.equal('VENTA');

        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');

        await useIdentity('usuario1@res2');
        await chai.expect(
            confirmarTransaccion(productoId, true, undefined)
        ).to.be.rejectedWith(Error);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
    });


    it('Confirmación de compra de un producto por la compañía vendedora primero', async () => {
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);
        (await getProducto(productoId)).estado.should.equal('VENTA');

        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].orgVenta.confirmacion.should.equal(false);
        transacciones[0].orgCompra.confirmacion.should.equal(false);
        chai.expect(transacciones[0].nuevaLocalizacion).to.be.undefined;
        (await getProducto(productoId)).transaccionId.should.equal(transacciones[0].transaccionId);

        await useIdentity('usuario1@pes1');
        await confirmarTransaccion(productoId, true, undefined);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].orgVenta.confirmacion.should.equal(true);
        transacciones[0].orgCompra.confirmacion.should.equal(false);
        chai.expect(transacciones[0].nuevaLocalizacion).to.be.undefined;

        await useIdentity('usuario1@res1');
        await confirmarTransaccion(productoId, true, 'res1-loc1');
        var producto = await getProducto(productoId);
        producto.estado.should.equal('PARADO');
        producto.operacionActual.localizacion.$identifier.should.equal('res1-loc1');
        producto.operacionActual.orgId.should.equal('res1');
        chai.expect(producto.operacionActual.datosVenta).to.be.undefined;
        chai.expect(producto.transaccionId).to.be.undefined;
        producto.operaciones.should.have.lengthOf(1);
        producto.operaciones[0].orgId.should.equal('pes1');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(0);
    });


    it('Confirmación de compra de un producto por la compañía compradora primero', async () => {
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);
        (await getProducto(productoId)).estado.should.equal('VENTA');

        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].orgVenta.confirmacion.should.equal(false);
        transacciones[0].orgCompra.confirmacion.should.equal(false);
        chai.expect(transacciones[0].nuevaLocalizacion).to.be.undefined;
        (await getProducto(productoId)).transaccionId.should.equal(transacciones[0].transaccionId);

        await useIdentity('usuario1@res1');
        await confirmarTransaccion(productoId, true, 'res1-loc1');
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].orgVenta.confirmacion.should.equal(false);
        transacciones[0].orgCompra.confirmacion.should.equal(true);
        transacciones[0].nuevaLocalizacion.should.equal('res1-loc1');

        await useIdentity('usuario1@pes1');
        await confirmarTransaccion(productoId, true, undefined);
        var producto = await getProducto(productoId);
        producto.estado.should.equal('PARADO');
        producto.operacionActual.localizacion.$identifier.should.equal('res1-loc1');
        producto.operacionActual.orgId.should.equal('res1');
        chai.expect(producto.operacionActual.datosVenta).to.be.undefined;
        chai.expect(producto.transaccionId).to.be.undefined;
        producto.operaciones.should.have.lengthOf(1);
        producto.operaciones[0].orgId.should.equal('pes1');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(0);
    });


    it('Confirmación de compra de un producto por la compañía vendedora primero y cancelación', async () => {
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);
        (await getProducto(productoId)).estado.should.equal('VENTA');

        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].orgVenta.confirmacion.should.equal(false);
        transacciones[0].orgCompra.confirmacion.should.equal(false);
        chai.expect(transacciones[0].nuevaLocalizacion).to.be.undefined;
        (await getProducto(productoId)).transaccionId.should.equal(transacciones[0].transaccionId);

        await useIdentity('usuario1@pes1');
        await confirmarTransaccion(productoId, true, undefined);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].orgVenta.confirmacion.should.equal(true);
        transacciones[0].orgCompra.confirmacion.should.equal(false);
        chai.expect(transacciones[0].nuevaLocalizacion).to.be.undefined;

        await useIdentity('usuario1@res1');
        await confirmarTransaccion(productoId, false, 'res1-loc1');
        transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(0);

        var producto = await getProducto(productoId);
        producto.operacionActual.orgId.should.equal('pes1');
        producto.estado.should.equal('VENTA');
        chai.expect(producto.transaccionId).to.be.undefined;
    });


    it('Confirmación de compra de un producto por la compañía compradora primero y cancelación', async () => {
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);
        (await getProducto(productoId)).estado.should.equal('VENTA');

        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].orgVenta.confirmacion.should.equal(false);
        transacciones[0].orgCompra.confirmacion.should.equal(false);
        chai.expect(transacciones[0].nuevaLocalizacion).to.be.undefined;
        (await getProducto(productoId)).transaccionId.should.equal(transacciones[0].transaccionId);

        await useIdentity('usuario1@res1');
        await chai.expect(
            confirmarTransaccion(productoId, true, 'res1-err')
        ).to.be.rejectedWith(Error);
        await confirmarTransaccion(productoId, true, 'res1-loc1');
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        transacciones[0].orgVenta.confirmacion.should.equal(false);
        transacciones[0].orgCompra.confirmacion.should.equal(true);
        transacciones[0].nuevaLocalizacion.should.equal('res1-loc1');

        await useIdentity('usuario1@pes1');
        await confirmarTransaccion(productoId, false, undefined);
        transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(0);

        var producto = await getProducto(productoId);
        producto.operacionActual.orgId.should.equal('pes1');
        producto.estado.should.equal('VENTA');
        chai.expect(producto.transaccionId).to.be.undefined;
    });

    it('Rechazo de todas las transaciones en estado de puja de un producto', async () => {
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        var regPuja = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Puja');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'R1', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res2', 'R2', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await ponerVentaProducto(productoId, 'PUJA', '€', 13);

        await useIdentity('usuario1@res1');
        await pujarProducto(productoId, 14);

        await useIdentity('usuario1@res2');
        await pujarProducto(productoId, 15);
        
        await useIdentity('usuario1@pes1');
        await finalizarPuja(productoId);
        var producto = await getProducto(productoId);
        producto.estado.should.equal('TRANSACCION');
        var tran = await getTransaccion(producto.transaccionId);
        tran.orgCompra.orgId.should.equal('res2');

        await useIdentity('usuario1@pes1');
        await confirmarTransaccion(productoId, true, undefined);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');

        await useIdentity('usuario1@res2');
        await confirmarTransaccion(productoId, false, undefined);

        var producto = await getProducto(productoId);
        producto.estado.should.equal('TRANSACCION');
        var tran = await getTransaccion(producto.transaccionId);
        tran.orgCompra.orgId.should.equal('res1');

        await useIdentity('usuario1@res2');
        await chai.expect(
            confirmarTransaccion(productoId, true, 'res2-loc1')
        ).to.be.rejectedWith(Error);

        await useIdentity('usuario1@res1');
        await confirmarTransaccion(productoId, false, undefined);
        var producto = await getProducto(productoId);
        producto.estado.should.equal('PARADO');
        producto.operacionActual.orgId.should.equal('pes1');
        producto.operaciones.should.have.lengthOf(0);
        chai.expect(producto.transaccionId).to.be.undefined;

    });


    it('Test División de un producto con datos incorrectos', async () => {
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        await crearProducto('producto1',{
                "tipoProducto" : "PESCADO",
                "variedadProducto" : "sardina",
                "descripcion" : "Descripción del producto", 
                "tipo" : "UNIDAD",
                "unidades" : 4,
                "peso" : 5.5,
                "magnitudPeso" : 'kg'
            }, undefined, {
                "latitud" : 1.3,
                "longitud" : 2.5,
                "direccion" : "dirección de prueba"
            }, 
            undefined);
        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(1);
        var producto = productos[productos.length - 1];
        await chai.expect(
            dividirProducto(producto.productoId, [
                {
                    "peso" : 3.5,
                    "imagen" : {
                        "hashImagen": "asldjfaslddoqwhe23",
                        "url" : "https://ejemplo1.com",
                        "algoritmo" : "sha1"
                    }
                },
                {
                    "peso" : 9.4,
                    "imagen" : {
                        "hashImagen": "asldjfaslddoqwhe23",
                        "url" : "https://ejemplo1.com",
                        "algoritmo" : "sha1"
                    }
                }
            ])
        ).to.be.rejectedWith(Error);

        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(1);
        var producto = productos[productos.length - 1];
        await chai.expect(
            dividirProducto(producto.productoId, [
                {
                    "unidad" : 1.5,
                    "imagen" : {
                        "hashImagen": "asldjfaslddoqwhe23",
                        "url" : "https://ejemplo1.com",
                        "algoritmo" : "sha1"
                    }
                },
                {
                    "peso" : 1.4,
                    "imagen" : {
                        "hashImagen": "asldjfaslddoqwhe23",
                        "url" : "https://ejemplo1.com",
                        "algoritmo" : "sha1"
                    }
                }
            ])
        ).to.be.rejectedWith(Error);

        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(1);
        var producto = productos[productos.length - 1];
        await chai.expect(
            dividirProducto(producto.productoId, [
                {
                    "unidad" : 2,
                    "imagen" : {
                        "hashImagen": "asldjfaslddoqwhe23",
                        "url" : "https://ejemplo1.com",
                        "algoritmo" : "sha1"
                    }
                },
                {
                    "peso" : 3,
                    "imagen" : {
                        "hashImagen": "asldjfaslddoqwhe23",
                        "url" : "https://ejemplo1.com",
                        "algoritmo" : "sha1"
                    }
                }
            ])
        ).to.be.rejectedWith(Error);

        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(1);
        var producto = productos[productos.length - 1];
        await chai.expect(
            dividirProducto(producto.productoId, [
                {
                    "unidad" : 2,
                    "imagen" : {
                        "hashImagen": "asldjfaslddoqwhe23",
                        "url" : "https://ejemplo1.com",
                        "algoritmo" : "sha1"
                    }
                },
                {
                    "imagen" : {
                        "hashImagen": "asldjfaslddoqwhe23",
                        "url" : "https://ejemplo1.com",
                        "algoritmo" : "sha1"
                    }
                }
            ])
        ).to.be.rejectedWith(Error);
    });


    it('Test División de un producto por UNIDAD', async () => {
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        await crearProducto('producto1',{
                "tipoProducto" : "PESCADO",
                "variedadProducto" : "sardina",
                "descripcion" : "Descripción del producto", 
                "tipo" : "UNIDAD",
                "unidades" : 4,
                "peso" : 5.5,
                "magnitudPeso" : 'kg'
            }, undefined, {
                "latitud" : 1.3,
                "longitud" : 2.5,
                "direccion" : "dirección de prueba"
            }, 
            undefined);
        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(1);
        var producto = productos[productos.length - 1];
        await dividirProducto(producto.productoId, [{
                "unidades" : 3,
                "identificador" : "id1",
                "imagen" : {
                    "hashImagen": "hash1",
                    "url" : "https://ejemplo1.com",
                    "algoritmo" : "sha1"
                }
            },{
                "unidades" : 1,
                "identificador" : "id2",
                "imagen" : {
                    "hashImagen": "hash2",
                    "url" : "https://ejemplo2.com",
                    "algoritmo" : "sha1"
                }
            }
        ]);

        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(3);
        var producto = productos[0];
        producto.identificador.should.equal('producto1');
        producto.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        producto.caracteristicas.variedadProducto.should.equal('sardina');
        producto.caracteristicas.descripcion.should.equal('Descripción del producto');
        producto.caracteristicas.tipo.should.equal('UNIDAD');
        producto.caracteristicas.unidades.should.equal(4);
        producto.caracteristicas.peso.should.equal(5.5);
        producto.caracteristicas.magnitudPeso.should.equal('kg');
        chai.expect(producto.imagen).to.be.undefined;
        chai.expect(producto.predecesor).to.be.undefined;
        producto.sucesores.should.have.lengthOf(2);
        chai.expect(producto.transaccionId).to.be.undefined;
        producto.estado.should.equal('DIVIDIDO');
        producto.operaciones.should.have.lengthOf(0);
        producto.operacionActual.orgId.should.equal('pes1');
        chai.expect(producto.operacionActual.datosVenta).to.be.undefined;

        var sucesor1 = await regProducto.get(producto.sucesores[0].$identifier);
        sucesor1.identificador.should.equal('id1');
        sucesor1.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        sucesor1.caracteristicas.variedadProducto.should.equal('sardina');
        sucesor1.caracteristicas.descripcion.should.equal('Descripción del producto');
        sucesor1.caracteristicas.tipo.should.equal('UNIDAD');
        sucesor1.caracteristicas.unidades.should.equal(3);
        sucesor1.caracteristicas.peso.should.equal(5.5);
        sucesor1.caracteristicas.magnitudPeso.should.equal('kg');
        sucesor1.predecesor.$identifier.should.equal(producto.productoId);
        chai.expect(sucesor1.sucesores).to.be.undefined;
        chai.expect(sucesor1.transaccionId).to.be.undefined;
        sucesor1.estado.should.equal('PARADO');
        sucesor1.operaciones.should.have.lengthOf(0);
        sucesor1.operacionActual.orgId.should.equal('pes1');
        chai.expect(sucesor1.operacionActual.datosVenta).to.be.undefined;

        var sucesor2 = await regProducto.get(producto.sucesores[1].$identifier);
        sucesor2.identificador.should.equal('id2');
        sucesor2.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        sucesor2.caracteristicas.variedadProducto.should.equal('sardina');
        sucesor2.caracteristicas.descripcion.should.equal('Descripción del producto');
        sucesor2.caracteristicas.tipo.should.equal('UNIDAD');
        sucesor2.caracteristicas.unidades.should.equal(1);
        sucesor2.caracteristicas.peso.should.equal(5.5);
        sucesor2.caracteristicas.magnitudPeso.should.equal('kg');
        sucesor2.predecesor.$identifier.should.equal(producto.productoId);
        chai.expect(sucesor2.sucesores).to.be.undefined;
        chai.expect(sucesor2.transaccionId).to.be.undefined;
        sucesor2.estado.should.equal('PARADO');
        sucesor2.operaciones.should.have.lengthOf(0);
        sucesor2.operacionActual.orgId.should.equal('pes1');
        chai.expect(sucesor1.operacionActual.datosVenta).to.be.undefined;
    });


    it('Test División de un producto por PESO', async () => {
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        await crearProducto('producto1',{
                "tipoProducto" : "PESCADO",
                "variedadProducto" : "sardina",
                "descripcion" : "Descripción del producto", 
                "tipo" : "PESO",
                "unidades" : 4,
                "peso" : 5.5,
                "magnitudPeso" : 'kg'
            }, undefined, {
                "latitud" : 1.3,
                "longitud" : 2.5,
                "direccion" : "dirección de prueba"
            }, 
            undefined);
        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(1);
        var producto = productos[productos.length - 1];
        await dividirProducto(producto.productoId, [{
                "peso" : 3,
                "identificador" : "id1",
                "imagen" : {
                    "hashImagen": "hash1",
                    "url" : "https://ejemplo1.com",
                    "algoritmo" : "sha1"
                }
            },{
                "peso" : 1.5,
                "identificador" : "id2",
                "imagen" : {
                    "hashImagen": "hash2",
                    "url" : "https://ejemplo2.com",
                    "algoritmo" : "sha1"
                }
            }
        ]);

        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(3);
        var producto = productos[0];
        producto.identificador.should.equal('producto1');
        chai.expect(producto.caracteristicas.unidades).to.be.undefined;
        producto.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        producto.caracteristicas.variedadProducto.should.equal('sardina');
        producto.caracteristicas.descripcion.should.equal('Descripción del producto');
        producto.caracteristicas.tipo.should.equal('PESO');
        producto.caracteristicas.peso.should.equal(5.5);
        producto.caracteristicas.magnitudPeso.should.equal('kg');
        chai.expect(producto.imagen).to.be.undefined;
        chai.expect(producto.predecesor).to.be.undefined;
        producto.sucesores.should.have.lengthOf(2);
        chai.expect(producto.transaccionId).to.be.undefined;
        producto.estado.should.equal('DIVIDIDO');
        producto.operaciones.should.have.lengthOf(0);
        producto.operacionActual.orgId.should.equal('pes1');
        chai.expect(producto.operacionActual.datosVenta).to.be.undefined;

        var sucesor1 = await regProducto.get(producto.sucesores[0].$identifier);
        sucesor1.identificador.should.equal('id1');
        chai.expect(sucesor1.caracteristicas.unidades).to.be.undefined;
        sucesor1.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        sucesor1.caracteristicas.variedadProducto.should.equal('sardina');
        sucesor1.caracteristicas.descripcion.should.equal('Descripción del producto');
        sucesor1.caracteristicas.tipo.should.equal('PESO');
        sucesor1.caracteristicas.peso.should.equal(3);
        sucesor1.caracteristicas.magnitudPeso.should.equal('kg');
        sucesor1.predecesor.$identifier.should.equal(producto.productoId);
        chai.expect(sucesor1.sucesores).to.be.undefined;
        chai.expect(sucesor1.transaccionId).to.be.undefined;
        sucesor1.estado.should.equal('PARADO');
        sucesor1.operaciones.should.have.lengthOf(0);
        sucesor1.operacionActual.orgId.should.equal('pes1');
        chai.expect(sucesor1.operacionActual.datosVenta).to.be.undefined;

        var sucesor2 = await regProducto.get(producto.sucesores[1].$identifier);
        chai.expect(sucesor2.caracteristicas.unidades).to.be.undefined;
        sucesor2.identificador.should.equal('id2');
        sucesor2.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        sucesor2.caracteristicas.variedadProducto.should.equal('sardina');
        sucesor2.caracteristicas.descripcion.should.equal('Descripción del producto');
        sucesor2.caracteristicas.tipo.should.equal('PESO');
        sucesor2.caracteristicas.peso.should.equal(1.5);
        sucesor2.caracteristicas.magnitudPeso.should.equal('kg');
        sucesor2.predecesor.$identifier.should.equal(producto.productoId);
        chai.expect(sucesor2.sucesores).to.be.undefined;
        chai.expect(sucesor2.transaccionId).to.be.undefined;
        sucesor2.estado.should.equal('PARADO');
        sucesor2.operaciones.should.have.lengthOf(0);
        sucesor2.operacionActual.orgId.should.equal('pes1');
        chai.expect(sucesor1.operacionActual.datosVenta).to.be.undefined;
    });



    it('Test transacción ConsumirProducto', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);

        await useIdentity('usuario1@res1');
        await chai.expect(
            consumirProducto(productoId)
        ).to.be.rejectedWith(Error);
        await comprarProducto(productoId);
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion');
        var transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(1);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        await confirmarTransaccion(productoId, true, 'res1-loc1');
        await chai.expect(
            consumirProducto(productoId)
        ).to.be.rejectedWith(Error);

        await useIdentity('usuario1@pes1');
        await confirmarTransaccion(productoId, true, undefined);
        (await getProducto(productoId)).estado.should.equal('PARADO');
        transacciones = await regT.getAll();
        transacciones.should.have.lengthOf(0);

        await useIdentity('usuario1@res1');
        await consumirProducto(productoId);
        var producto = await getProducto(productoId);
        producto.operacionActual.orgId.should.equal('res1');
        producto.estado.should.equal('CONSUMIDO');
        chai.expect(producto.transaccionId).to.be.undefined;
    });


    it('Test trasacción CancelarVenta (NORMAL)', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await chai.expect(
            cancelarVenta(productoId)
        ).to.be.rejectedWith(Error);
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);
        (await getProducto(productoId)).estado.should.equal('VENTA');
        await cancelarVenta(productoId);
        var producto = await getProducto(productoId);
        producto.estado.should.equal('PARADO');
        chai.expect(producto.operacionActual.datosVenta).to.be.undefined;

    });


    it('Test trasacción CancelarVenta (PUJA)', async () => {
        var regPuja = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Puja');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await chai.expect(
            cancelarVenta(productoId)
        ).to.be.rejectedWith(Error);
        await ponerVentaProducto(productoId, 'PUJA', '€', 13.4);
        (await regPuja.getAll()).should.have.lengthOf(1);
        var producto = await getProducto(productoId);
        producto.estado.should.equal('PUJA');
        await getPuja(producto.operacionActual.datosVenta.pujaId);
        await cancelarVenta(productoId);
        (await regPuja.getAll()).should.have.lengthOf(0);
        (await getProducto(productoId)).estado.should.equal('PARADO');

    });


    it('Test trasacción ProductoPerdido con producto en estado CONSUMIDO', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await consumirProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('CONSUMIDO');
        await chai.expect(
            productoPerdido(productoId)
        ).to.be.rejectedWith(Error);
        var producto = await getProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('CONSUMIDO');
    });

    it('Test trasacción ProductoPerdido con producto en estado PERDIDO', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await productoPerdido(productoId);
        await chai.expect(
            productoPerdido(productoId)
        ).to.be.rejectedWith(Error);
        var producto = await getProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('PERDIDO');

    });

    it('Test trasacción ProductoPerdido con producto en estado DIVIDIDO', async () => {
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        await crearProducto('producto1',{
                "tipoProducto" : "PESCADO",
                "variedadProducto" : "sardina",
                "descripcion" : "Descripción del producto", 
                "tipo" : "PESO",
                "unidades" : 4,
                "peso" : 5.5,
                "magnitudPeso" : 'kg'
            }, undefined, {
                "latitud" : 1.3,
                "longitud" : 2.5,
                "direccion" : "dirección de prueba"
            }, 
            undefined);
        var productos = await regProducto.getAll();
        productos.should.have.lengthOf(1);
        var producto = productos[productos.length - 1];
        await dividirProducto(producto.productoId, [{
                "peso" : 3,
                "identificador" : "id1",
                "imagen" : {
                    "hashImagen": "hash1",
                    "url" : "https://ejemplo1.com",
                    "algoritmo" : "sha1"
                }
            },{
                "peso" : 1.5,
                "identificador" : "id2",
                "imagen" : {
                    "hashImagen": "hash2",
                    "url" : "https://ejemplo2.com",
                    "algoritmo" : "sha1"
                }
            }
        ]);

        (await getProducto(producto.productoId)).estado.should.equal('DIVIDIDO');
        await chai.expect(
            productoPerdido(producto.productoId)
        ).to.be.rejectedWith(Error);
        (await getProducto(producto.productoId)).estado.should.equal('DIVIDIDO');

    });

    it('Test trasacción ProductoPerdido con producto en estado PARADO', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await productoPerdido(productoId);
        var producto = await getProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('PERDIDO');

    });

    it('Test trasacción ProductoPerdido con producto en estado VENTA', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);

        (await getProducto(productoId)).estado.should.equal('VENTA');
        await productoPerdido(productoId);
        var producto = await getProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('PERDIDO');

    });

    it('Test trasacción ProductoPerdido con producto en estado PUJA', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        await ponerVentaProducto(productoId, 'PUJA', '€', 13.4);

        (await getProducto(productoId)).estado.should.equal('PUJA');
        await productoPerdido(productoId);
        var producto = await getProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('PERDIDO');

    });

    it('Test trasacción ProductoPerdido con producto en estado TRANSACCION', async () => {
        await crearOrganizacionyUsuario('pes1', 'LONXA', 'admin', 'usuario1');
        await crearOrganizacionyUsuario('res1', 'RESTAURANTE', 'admin', 'usuario1');

        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
        const productoId = await crearProductoEjemplo();
        (await getProducto(productoId)).estado.should.equal('PARADO');
        await ponerVentaProducto(productoId, 'NORMAL', '€', 13.4);
        (await getProducto(productoId)).estado.should.equal('VENTA');
        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);

        (await getProducto(productoId)).estado.should.equal('TRANSACCION');
        await chai.expect(
            productoPerdido(productoId)
        ).to.be.rejectedWith(Error);
        var producto = await getProducto(productoId);
        (await getProducto(productoId)).estado.should.equal('TRANSACCION');

    });
});