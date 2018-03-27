'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const IdCard = require('composer-common').IdCard;
const MemoryCardStore = require('composer-common').MemoryCardStore;
const path = require('path');
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

describe('Sample', () => {

    const NS_PAR = 'org.peixeencadeado.participantes';
    const NS_PEIXE = 'org.peixeencadeado.peixe';
    const NS_ORG = 'org.peixeencadeado.organizacions';
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = new MemoryCardStore();

    // Embedded connection used for local testing
    const connectionProfile = {
        name: 'embedded',
        type: 'embedded'
    };

    // Name of the business network card containing the administrative identity for the business network
    const adminCardName = 'admin';

    // Admin connection to the blockchain, used to deploy the business network
    let adminConnection;

    // This is the business network connection the tests will use.
    let businessNetworkConnection;

    // This is the factory for creating instances of types.
    let factory;

    // These are the identities for Alice and Bob.
    const aliceCardName = 'alice';
    const bobCardName = 'bob';

    // These are a list of receieved events.
    let events;

    let businessNetworkName;

    before(() => {
        // Embedded connection does not need real credentials
        const credentials = {
            certificate: 'FAKE CERTIFICATE',
            privateKey: 'FAKE PRIVATE KEY'
        };

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

        return adminConnection.importCard(deployerCardName, deployerCard).then(() => {
            return adminConnection.connect(deployerCardName);
        });
    });

    /**
     *
     * @param {String} cardName The card name to use for this identity
     * @param {Object} identity The identity details
     * @returns {Promise} resolved when the card is imported
     */
    function importCardForIdentity(cardName, identity) {
        const metadata = {
            userName: identity.userID,
            version: 1,
            enrollmentSecret: identity.userSecret,
            businessNetwork: businessNetworkName
        };
        const card = new IdCard(metadata, connectionProfile);
        return adminConnection.importCard(cardName, card);
    }

    // This is called before each test is executed.
    beforeEach(() => {
        let businessNetworkDefinition;

        // Generate a business network definition from the project directory.
        return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'))
            .then(definition => {
                businessNetworkDefinition = definition;
                businessNetworkName = definition.getName();
                return adminConnection.install(businessNetworkName);
            })
            .then(() => {
                const startOptions = {
                    networkAdmins: [
                        {
                            userName: 'admin',
                            enrollmentSecret: 'adminpw'
                        }
                    ]
                };
                return adminConnection.start(businessNetworkDefinition, startOptions);
            }).then(adminCards => {
                return adminConnection.importCard(adminCardName, adminCards.get('admin'));
            })
            .then(() => {
                // Create and establish a business network connection
                businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
                events = [];
                businessNetworkConnection.on('event', event => {
                    events.push(event);
                });
                return businessNetworkConnection.connect(adminCardName);
            })
            .then(() => {
                // Get the factory for the business network.
                factory = businessNetworkConnection.getBusinessNetwork().getFactory();

                return businessNetworkConnection.getParticipantRegistry(NS_PAR + '.Participante');
            })
            
            .then(participantRegistry => {
                // Create the participants.
                const alice = factory.newResource(NS_PAR, 'Participante', 'alice@email.com');
                alice.nome = 'Alice';

                const bob = factory.newResource(NS_PAR, 'Participante', 'bob@email.com');
                bob.nome = 'Bob';

                participantRegistry.addAll([alice, bob]);
            })
            .then(() => {
                return businessNetworkConnection.getAssetRegistry(NS_ORG + '.Pesqueira');
            })
            .then(function(rexistroPesqueira) {
                var pesqueira = factory.newResource(NS_ORG, 'Pesqueira','pesqueira1');
                pesqueira.email = pesqueira.orgId;
                pesqueira.administrador = factory.newRelationship(NS_PAR, 'Participante', 'participante1');
                return rexistroPesqueira.add(pesqueira);
            })
            .then(function() {
                return businessNetworkConnection.getAssetRegistry(NS_ORG + '.Empresa');
            })
            .then(function(rexistroEmpresa) {        
                var empresa = factory.newResource(NS_ORG, 'Empresa','empresa1');
                empresa.email = empresa.orgId;
                empresa.administrador = factory.newRelationship(NS_PAR, 'Participante', 'participante2');
                return rexistroEmpresa.add(empresa);
            })
            .then(function() {
            return businessNetworkConnection.getAssetRegistry(NS_PEIXE + '.Peixe');
            })
            .then(function(rexistroPeixe) {
                var peixes = [
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe1'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe2'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe3'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe4'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe5'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe6'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe7'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe8'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe9'),
                    factory.newResource(NS_PEIXE, 'Peixe', 'peixe10')
                ];
                peixes.forEach(function(peixe, index) {
                    var coordenadas = factory.newConcept(NS_PEIXE,'Coordenadas');
                    coordenadas.lonxitude = 3.14;
                    coordenadas.latitude = -74.23;
                    peixe.coordenadas = coordenadas;
                    peixe.variedade = 'xurelo';
                    peixe.dataCaptura = new Date();
                    peixe.pesqueira = factory.newRelationship(NS_ORG, 'Pesqueira', 'pesqueira1');
                    peixe.compras = [];
                    peixe.estado = 'CAPTURADO';
                    peixe.peso = 1.1;
                });
                return rexistroPeixe.addAll(peixes);
            })
            .then(() => {
                // Issue the identities.
                return businessNetworkConnection.issueIdentity(NS_PAR + '.Participante#alice@email.com', 'alice1');
            })
            .then(identity => {
                return importCardForIdentity(aliceCardName, identity);
            }).then(() => {
                return businessNetworkConnection.issueIdentity(NS_PAR + '.Participante#bob@email.com', 'bob1');
            })
            .then((identity) => {
                return importCardForIdentity(bobCardName, identity);
            });
    });

    /**
     * Reconnect using a different identity.
     * @param {String} cardName The name of the card for the identity to use
     * @return {Promise} A promise that will be resolved when complete.
     */
    function useIdentity(cardName) {
        return businessNetworkConnection.disconnect()
            .then(() => {
                businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
                events = [];
                businessNetworkConnection.on('event', (event) => {
                    events.push(event);
                });
                return businessNetworkConnection.connect(cardName);
            })
            .then(() => {
                factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            });
    }

    it('Alice can read all of the assets', () => {

        // Use the identity for Alice.
        return useIdentity(aliceCardName)
            .then(() => {

                // Get the assets.
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
