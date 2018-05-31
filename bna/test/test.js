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
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );

    // Embedded connection used for local testing
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded'
    };

    // Name of the business network card containing the administrative identity for the business network
    const adminCardName = 'admin';

    // Admin connection to the blockchain, used to deploy the business network
    let adminConnection;

    // This is the business network connection the tests will use.
    let businessNetworkConnection;

    // This is the factory for creating instances of types.
    let factory;

    // These are a list of receieved events.
    let events;

    let businessNetworkName;

    before(async () => {
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' });

        // Identity used with the admin connection to deploy business networks
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

    /**
     *
     * @param {String} cardName The card name to use for this identity
     * @param {Object} identity The identity details
     */
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

    // This is called before each test is executed.
    beforeEach(async () => {
        // Generate a business network definition from the project directory.
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

        // Create and establish a business network connection
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
        events = [];
        businessNetworkConnection.on('event', event => {
            events.push(event);
        });
        await businessNetworkConnection.connect(adminCardName);

        // Get the factory for the business network.
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();

    });

    /**
     * Reconnect using a different identity.
     * @param {String} cardName The name of the card for the identity to use
     */
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

    async function crearParticipanteUsuario(email, nombre) {
        const transaction = factory.newTransaction(NS_PAR, 'CrearParticipanteUsuario');

        transaction.email = email;
        transaction.nombre = nombre;
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

    async function crearProducto(variedad, peso, latitud, longitud, descripcion){
        let transaction = factory.newTransaction(NS_PROD, 'CrearProducto');
        transaction.variedad = variedad;
        transaction.peso = peso;
        transaction.latitud = latitud;
        transaction.longitud = longitud;
        transaction.descripcion = descripcion;
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


    it('Creación de una organización y de su administrador', async () => {
        await useIdentity('admin');
        await crearOrganizacion('OrganizacionProba', 'LONXA', 'descripcion', 'admin', 'admin@OrganizacionProba');

        const regOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Organizacion');
        const org = await regOrg.get('OrganizacionProba');
        org.orgId.should.equal('OrganizacionProba');
        const regPar = await businessNetworkConnection.getParticipantRegistry(NS_PAR + '.OrgAdmin');
        const par = await regPar.get('admin@OrganizacionProba');
        par.email.should.equal('admin@OrganizacionProba');
        par.nombre.should.equal('admin');

    });
    

    it('Creación de un producto', async () => {

        await useIdentity('admin');
        await crearOrganizacion('pes1', 'LONXA', 'descripcion', 'admin', 'admin@pes1');
        await useIdentity('admin@pes1');
        await crearParticipanteUsuario('usuario1@pes1', 'usuario');
        await useIdentity('usuario1@pes1');
        await crearProducto('producto1', 1.2, 12, 23, 'Descripción');
        const regOrg = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto');
        events.should.have.lengthOf(1);
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
        
        await crearOrganizacion('pes1', 'LONXA', 'descripcion', 'admin', 'admin@pes1');
        await crearOrganizacion('res1', 'RESTAURANTE', 'descripcion', 'admin', 'admin@res1');

        await useIdentity('admin@pes1');
        await crearParticipanteUsuario('usuario1@pes1', 'usuario');
        await useIdentity('usuario1@pes1');
        await crearProducto('XURELO', 1.2, 12, 23, 'Descripción');
        events.should.have.lengthOf(1);
        var productoId = events[0].productoId;

        await useIdentity('admin@res1');
        await crearParticipanteUsuario('usuario1@res1', 'usuario');
        await useIdentity('usuario1@res1');
        await comprarProducto(productoId);
        
        var regProducto = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Producto')
        var producto = await regProducto.get(productoId);
        var regT = await businessNetworkConnection.getAssetRegistry(NS_PROD + '.Transaccion')
        var transaccion = await regT.get(producto.transaccion.transaccionId);
        
        await confirmarTransaccion(productoId);
    });

});