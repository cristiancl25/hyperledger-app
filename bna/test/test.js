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

    async function crearLocalizacion(loc){
        const transaction = factory.newTransaction(NS_ORG, 'CrearLocalizacion');
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
        await importCardForIdentity(email, await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#' + email, email));
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

    async function comprarProducto(productoId){
        let transaction = factory.newTransaction(NS_PROD, 'ComprarProducto');
        transaction.productoId = productoId;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function confirmarTransaccion(productoId){
        let transaction = factory.newTransaction(NS_PROD, 'ConfirmarTransaccion');
        transaction.productoId = productoId;
        await businessNetworkConnection.submitTransaction(transaction);
    }


    it('Creación de una localización', async () => {
        const addr = "Dirección de prueba";
        await useIdentity('admin');
        await crearLocalizacion({
            "latitud" : 1.2,
            "longitud" : 1.8,
            "direccion" : addr
        });
        var regLoc = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Localizacion');
        var locs = await regLoc.getAll();
        locs.should.have.lengthOf(1);
        locs[0].latitud.should.equal(1.2);
        locs[0].longitud.should.equal(1.8);
        locs[0].direccion.should.equal(addr);
    });


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


    it('Creación de una organización y de su administrador', async () => {
        await useIdentity('admin');
        await crearTipoOrganizacion('LONXA');
        await crearOrganizacion('OrganizacionProba', 'LONXA', 'descripcion', 'admin', 'admin@OrganizacionProba');

        const regOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Organizacion');
        const org = await regOrg.get('OrganizacionProba');
        org.orgId.should.equal('OrganizacionProba');
        const regPar = await businessNetworkConnection.getParticipantRegistry(NS_PAR + '.OrgAdmin');
        const par = await regPar.get('admin@OrganizacionProba');
        par.email.should.equal('admin@OrganizacionProba');
        par.nombre.should.equal('admin');

    });
    

    it('Creación de un producto por UNIDAD, con nueva localización', async () => {
        await useIdentity('admin');
        await crearTipoOrganizacion('LONXA');
        await crearOrganizacion('pes1', 'LONXA', 'descripcion', 'admin', 'admin@pes1');
        await useIdentity('admin@pes1');
        await crearParticipante('usuario1@pes1', 'usuario', 'Usuario');
        await useIdentity('usuario1@pes1');
        await crearTipoProducto('PESCADO');
//        await crearLocalizacion({
//            "latitud" : 1.2,
//            "longitud" : 1.8,
//            "direccion" : 'direccion de prueba'
//        });
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
        events.should.have.lengthOf(1);

        var producto = await regProd.get(events[0].productoId);
        producto.identificador.should.equal('producto1');
        producto.caracteristicas.tipoProducto.$identifier.should.equal('PESCADO');
        producto.caracteristicas.variedadProducto.should.equal('sardina');
        producto.caracteristicas.descripcion.should.equal('Descripción del producto');
        producto.caracteristicas.tipo.should.equal('UNIDAD');
        producto.caracteristicas.unidades.should.equal(1);
        producto.caracteristicas.peso.should.equal(0.3);
        chai.expect(producto.caracteristicas.magnitudPeso).to.be.undefined;
        chai.expect(producto.imagen).to.be.undefined;
    });


    it('Creación de un producto con un participante NO válido', async () => {
        await useIdentity('admin');

        await chai.expect(
            crearProducto('producto1', 1.2, 12, 23, 'Descripción')
        ).to.be.rejectedWith(Error);
        chai.expect(events).to.eql([]);
    });


    it('Compra de un producto válido', async () => {

        await useIdentity('admin');
        await crearTipoOrganizacion('LONXA');
        await crearOrganizacion('pes1', 'LONXA', 'descripcion', 'admin', 'admin@pes1');
        await crearTipoOrganizacion('RESTAURANTE');
        await crearOrganizacion('res1', 'RESTAURANTE', 'descripcion', 'admin', 'admin@res1');

        await useIdentity('admin@pes1');
        await crearParticipante('usuario1@pes1', 'usuario', 'Usuario');
        await useIdentity('usuario1@pes1');
        await crearProducto('XURELO', 1.2, 12, 23, 'Descripción');
        events.should.have.lengthOf(1);
        var productoId = events[0].productoId;

        await useIdentity('admin@res1');
        await crearParticipante('usuario1@res1', 'usuario', 'Usuario');
        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto')
        var producto = await regProducto.get(productoId);
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion')
        var transaccion = await regT.get(producto.transaccion.transaccionId);
        
        await confirmarTransaccion(productoId);
    });
});