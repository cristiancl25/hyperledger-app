'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

const NS_PAR = 'org.peixeencadeado.participantes';
const NS_PEIXE = 'org.peixeencadeado.peixe';
const NS_ORG = 'org.peixeencadeado.organizacions';

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

        //let transaction = factory.newTransaction("org.peixeencadeado.peixe", "SetupDemo");
        //await businessNetworkConnection.submitTransaction(transaction);

        //await importCardForIdentity('admin@pes1', await businessNetworkConnection.issueIdentity(NS_PAR + '.OrgAdmin#admin@pes1', 'admin@pes1'));
        //await importCardForIdentity('admin@org1', await businessNetworkConnection.issueIdentity(NS_PAR + '.OrgAdmin#admin@org1', 'admin@org1'));
        //await importCardForIdentity('admin@org2', await businessNetworkConnection.issueIdentity(NS_PAR + '.OrgAdmin#admin@org2', 'admin@org2'));
        //await importCardForIdentity('participante1@pes1', await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#participante1@pes1', 'participante1@pes1'));
        //await importCardForIdentity('participante1@org1', await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#participante1@org1', 'participante1@org1'));
        //await importCardForIdentity('participante1@org2', await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#participante1@org2', 'participante1@org2'));
        //await importCardForIdentity('participante2@pes1', await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#participante2@pes1', 'participante2@pes1'));

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

    async function crearParticipanteUsuario(email, nome) {
        const transaction = factory.newTransaction(NS_PAR, 'CrearParticipanteUsuario');

        transaction.email = email;
        transaction.nome = nome;
        await businessNetworkConnection.submitTransaction(transaction);
        await importCardForIdentity(email, await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#' + email, email));
    }

    async function crearOrganizacion(orgId, tipoOrganizacion, descripcion, nomeAdmin, emailAdmin){
        const transaction = factory.newTransaction(NS_ORG, 'CrearOrganizacion');

        transaction.orgId = orgId;
        transaction.tipoOrganizacion = tipoOrganizacion;
        transaction.descripcion = descripcion;
        transaction.nomeAdmin = nomeAdmin;
        transaction.emailAdmin = emailAdmin;
        await businessNetworkConnection.submitTransaction(transaction);
        await importCardForIdentity(emailAdmin, await businessNetworkConnection.issueIdentity(NS_PAR + '.OrgAdmin#' + emailAdmin, emailAdmin, {issuer:true}));
    }

    async function crearPeixe(variedade, peso, latitude, lonxitude, descripcion){
        let transaction = factory.newTransaction(NS_PEIXE, 'CrearPeixe');
        transaction.variedade = variedade;
        transaction.peso = peso;
        transaction.latitude = latitude;
        transaction.lonxitude = lonxitude;
        transaction.descripcion = descripcion;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function comprarPeixe(peixeId){
        let transaction = factory.newTransaction(NS_PEIXE, 'ComprarPeixe');
        transaction.peixeId = peixeId;
        await businessNetworkConnection.submitTransaction(transaction);
    }

    async function confirmarTransaccion(peixeId){
        let transaction = factory.newTransaction(NS_PEIXE, 'ConfirmarTransaccion');
        transaction.peixeId = peixeId;
        await businessNetworkConnection.submitTransaction(transaction);
    }
    //it('Creación dun participante', async () => {
    //    await useIdentity('admin');
    //    await crearParticipanteUsuario('usuario1@pes1', 'usuario');
    //    const rexistro = await businessNetworkConnection.getParticipantRegistry('org.peixeencadeado.participantes.Usuario');
    //    const participante = await rexistro.get('usuario1@pes1');
    //    participante.nome.should.equal('usuario');
    //    participante.email.should.equal('usuario1@pes1');

    //    events.should.have.lengthOf(0);
    //});

    //it('creacion dunha organización cun participante non válido', async () => {
    //    await crearParticipanteUsuario('usuario1@pes1', 'usuario');
    //    await useIdentity('usuario1@pes1');
    //    await chai.expect(
    //        crearOrganizacion('OrganizacionProba', 'LONXA', 'descripcion', 'admin', 'admin@OrganizacionProba')
    //    ).to.be.rejectedWith(Error);
    //});

    it('Creación dunha organización e do seu administrador', async () => {

        await useIdentity('admin');
        await crearOrganizacion('OrganizacionProba', 'LONXA', 'descripcion', 'admin', 'admin@OrganizacionProba');

        const rexistroOrg = await businessNetworkConnection.getAssetRegistry(NS_ORG + '.Organizacion');
        const org = await rexistroOrg.get('OrganizacionProba');
        org.orgId.should.equal('OrganizacionProba');
        const rexistroPar = await businessNetworkConnection.getParticipantRegistry(NS_PAR + '.OrgAdmin');
        const par = await rexistroPar.get('admin@OrganizacionProba');
        par.email.should.equal('admin@OrganizacionProba');
        par.nome.should.equal('admin');

    });
    

    it('Creación dun peixe', async () => {

        await useIdentity('admin');
        await crearOrganizacion('pes1', 'LONXA', 'descripcion', 'admin', 'admin@pes1');
        await useIdentity('admin@pes1');
        await crearParticipanteUsuario('usuario1@pes1', 'usuario');
        await useIdentity('usuario1@pes1');
        await crearPeixe('peixe1', 1.2, 12, 23, 'Descripción');
        const rexistroOrg = await businessNetworkConnection.getAssetRegistry(NS_PEIXE + '.Peixe');
        events.should.have.lengthOf(1);
    });

    it('Creación dun peixe cun participante NON válido', async () => {

        await useIdentity('admin');
        await chai.expect(
            crearPeixe('peixe1', 1.2, 12, 23, 'Descripción')
        ).to.be.rejectedWith(Error);
        chai.expect(events).to.eql([]);
    });


    it('Compra dun peixe válido', async () => {

        await useIdentity('admin');
        
        await crearOrganizacion('pes1', 'LONXA', 'descripcion', 'admin', 'admin@pes1');
        await crearOrganizacion('res1', 'RESTAURANTE', 'descripcion', 'admin', 'admin@res1');

        await useIdentity('admin@pes1');
        await crearParticipanteUsuario('usuario1@pes1', 'usuario');
        await useIdentity('usuario1@pes1');
        await crearPeixe('XURELO', 1.2, 12, 23, 'Descripción');
        events.should.have.lengthOf(1);
        var peixeId = events[0].peixeId;

        await useIdentity('admin@res1');
        await crearParticipanteUsuario('usuario1@res1', 'usuario');
        await useIdentity('usuario1@res1');
        await comprarPeixe(peixeId);
        
        var rexistroPeixe = await businessNetworkConnection.getAssetRegistry(NS_PEIXE + '.Peixe')
        var peixe = await rexistroPeixe.get(peixeId);
        var rexistroTransaccion = await businessNetworkConnection.getAssetRegistry(NS_PEIXE + '.Transaccion')
        var transaccion = await rexistroTransaccion.get(peixe.transaccion.transaccionId);
        
        await confirmarTransaccion(peixeId);
    });

    //it('Comporobación de lectura no blockchain por parte do participante1@pes1', async() => {

    //    await useIdentity('participante1@pes1')
    //    var assetRegistry = await businessNetworkConnection.getAssetRegistry(NS_PEIXE + '.Peixe')
    //    var assets = await assetRegistry.getAll();
    //    assets.should.have.lengthOf(10);
    //});


    //it('Creación dun peixe cun participante válido', async () => {

    //    await useIdentity('participante1@pes1');
    //    let transaction = factory.newTransaction("org.peixeencadeado.peixe", "CrearPeixe");
    //    transaction.setPropertyValue('variedade', 'SARDIÑA');
    //    transaction.setPropertyValue('peso', 1.28);
    //    transaction.setPropertyValue('latitude', -1.45);
    //    transaction.setPropertyValue('lonxitude', 3.14);
    //    transaction.setPropertyValue('descripcion', 'sin descripcion');
    //    await businessNetworkConnection.submitTransaction(transaction);

    //    events.should.have.lengthOf(1);

    //    const rexistro = await businessNetworkConnection.getAssetRegistry('org.peixeencadeado.peixe.Peixe');
    //    const participante = await rexistro.get(events[0].peixeId);
    //    //TODO : Completar test
    //    //participante.nome.should.equal('usuario');
    //});


    //it('Compra dun peixe a pes1 por parte de org1', async () => {

    //    await useIdentity('participante1@org1');
    //    const transaction = factory.newTransaction('org.peixeencadeado.peixe', 'ComprarPeixe');
    //    transaction.peixeId = 'peixe1';
    //    await businessNetworkConnection.submitTransaction(transaction);

    //    const rexistro = await businessNetworkConnection.getAssetRegistry('org.peixeencadeado.peixe.Peixe');
    //    const peixe = await rexistro.get('peixe1');
    //    peixe.operacions.should.have.lengthOf(1);
    //    peixe.operacionActual.organizacion.$identifier.should.equal('org1');

    //    events.should.have.lengthOf(0);
    //});
});