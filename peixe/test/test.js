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

        let transaction = factory.newTransaction("org.peixeencadeado.peixe", "SetupDemo");
        await businessNetworkConnection.submitTransaction(transaction);

        await importCardForIdentity('admin@pes1', await businessNetworkConnection.issueIdentity(NS_PAR + '.OrgAdmin#admin@pes1', 'admin@pes1'));
        await importCardForIdentity('admin@org1', await businessNetworkConnection.issueIdentity(NS_PAR + '.OrgAdmin#admin@org1', 'admin@org1'));
        await importCardForIdentity('admin@org2', await businessNetworkConnection.issueIdentity(NS_PAR + '.OrgAdmin#admin@org2', 'admin@org2'));
        await importCardForIdentity('participante1@pes1', await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#participante1@pes1', 'participante1@pes1'));
        await importCardForIdentity('participante1@org1', await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#participante1@org1', 'participante1@org1'));
        await importCardForIdentity('participante1@org2', await businessNetworkConnection.issueIdentity(NS_PAR + '.Usuario#participante1@org2', 'participante1@org2'));

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

    it('Execución da transaccion CrearPeixe', async () => {

        // Use the identity for Alice.
        await useIdentity('admin@pes1')
        let transaction = factory.newTransaction("org.peixeencadeado.peixe", "CrearPeixe");
        transaction.setPropertyValue('variedade', 'SARDIÑA');
        transaction.setPropertyValue('peso', 1.28);
        transaction.setPropertyValue('latitude', -1.45);
        transaction.setPropertyValue('lonxitude', 3.14);

        await businessNetworkConnection.submitTransaction(transaction);

        console.log(events);
    });

    it('Comporobación de lectura no blockchain por parte de alice', () => {

        return useIdentity('participante1@org2')
        .then(() => {
            return businessNetworkConnection.getAssetRegistry(NS_PEIXE + '.Peixe')
            .then((assetRegistry) => {
                return assetRegistry.getAll();
            });
        })
        .then((assets) => {
            // Validate the assets.
            assets.should.have.lengthOf(10);
        });
    });
});