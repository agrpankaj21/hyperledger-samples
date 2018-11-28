/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

//const api = require('composer-runtime').Api;
const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

require('chai').should();
const { assert } = require('chai');
//let sinon = require('sinon');
//var util = require('./util');
//const crypto = require('crypto');
//const request = require('request');
//const request = require('request');
//const response = require('response');
//const fetch = require('fetch');
const CryptoJS = require('crypto-js');
//const https = require('https');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const namespace = 'org.example.basic';

function getTextFromURL(documentUrl){
    console.log('calling getTextFromURL - documentUrl'+documentUrl);
    // read text from URL location
    var responseStr;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        //console.log('ready state');
        if (request.readyState === 4 && request.status === 200) {
            //console.log('readyState: '+request.readyState);
            //console.log('request.status: '+request.status);
            var type = request.getResponseHeader('Content-Type');
            //console.log('content type: '+type);
            if (type.indexOf("text") !== 1) {
                console.log('request.responseText'+request.responseText);                        
                responseStr = request.responseText;
            }
            
        }
    }

    request.open('GET', documentUrl, false);
    request.send(null); 
    return responseStr;
}

function generateHashUsingCryptJS(documentUrl)
{
    //if(status){
    console.log('calling generateHashUsingCryptJS - documentUrl'+documentUrl);
    var documentContent =  getTextFromURL(documentUrl);  
   console.log('content fetched: '+ documentContent);
      //documentContent = 'daasdasdad';
      var hash = CryptoJS.SHA256(documentContent);
      if(hash) { 
        var hashStr = hash.toString(CryptoJS.enc.Hex);
        console.log('hashStr: '+hashStr);
       return hashStr;
      }
    //}             
}


describe('file_register', () => {
    // In-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );
    let adminConnection;
    let businessNetworkConnection;
    let factory;
    let registerFileTxn ;
    let fileUrl;
    let fileUrl1;
    let fileId;
    let validateFileTxn;
    let fileValidateEvent;
    let fileHash;
    let fileHash1;
    //let clock;

    before(async () => {
        // Embedded connection used for local testing
        const connectionProfile = {
            name: 'embedded',
            'x-type': 'embedded'
        };
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' });
        fileUrl = 'https://bitchrome.com/test.txt';
        fileUrl1 = 'https://bitchrome.com/test1.txt';
        fileId = '1234';
        //console.log('calling getFileHashFromURL filehash:'+fileHash);
        fileHash =  generateHashUsingCryptJS(fileUrl);
       //fileHash = 'abcd';
        //console.log('called getFileHashFromURL filehash:'+fileHash);
        fileHash1 =  generateHashUsingCryptJS(fileUrl1);
       //fileHash1 = 'dasdas';
        // PeerAdmin identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        const deployerCardName = 'PeerAdmin';
        deployerCard.setCredentials(credentials);

        // setup admin connection
        adminConnection = new AdminConnection({ cardStore: cardStore });
        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);

        const adminUserName = 'admin';
        const businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });

        // Install the Composer runtime for the new business network
        await adminConnection.install(businessNetworkDefinition);

        // Start the business network and configure an network admin identity
        const startOptions = {
            networkAdmins: [
                {
                    userName: adminUserName,
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkDefinition.getName(), businessNetworkDefinition.getVersion(), startOptions);

        // Import the network admin identity for us to use
        const adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`;
        await adminConnection.importCard(adminCardName, adminCards.get(adminUserName));

        // Connect to the business network using the network admin identity
        await businessNetworkConnection.connect(adminCardName);

        factory = businessNetworkConnection.getBusinessNetwork().getFactory();
       // const setupDemo = factory.newTransaction(namespace, 'SetupDemo');
        //await businessNetworkConnection.submitTransaction(setupDemo);
        
       businessNetworkConnection.on(namespace+'.FileValidateEvent', (event) => {
           console.log('****filevalidateevent callback being called******');
            fileValidateEvent = event;
            console.log(fileValidateEvent);
        });      
    });

    beforeEach(() => {
        //clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        //clock.restore();
    });

    describe('#file_registration', () => {

        let fileAsset;

        it('should be able to register', async () => {
            // submit the temperature reading
            registerFileTxn = factory.newTransaction(namespace, 'RegisterFileTransaction');
           // registerFileTxn.fileUrl = fileUrl;
            registerFileTxn.fileId = fileId;
            registerFileTxn.fileHash = fileHash;
            await businessNetworkConnection.submitTransaction(registerFileTxn);
            //const assetRegistry = await api.getAssetRegistry('org.example.basic.FileAsset');
            const assetRegistry = await businessNetworkConnection.getAssetRegistry('org.example.basic.FileAsset');
            fileAsset = await assetRegistry.get(registerFileTxn.fileId);           
            assert.equal(fileAsset.fileId,registerFileTxn.fileId,'fileAsset.fileId: '+fileAsset.fileId);
            assert.isNotNull(fileAsset.hash,'hash value is: '+fileAsset.hash);
           
        });

        it('should confirm the file by checking hash from blockchain', async () => {      
            validateFileTxn = factory.newTransaction(namespace, 'ValidateFileTransaction');
            validateFileTxn.fileHash = fileHash;
            validateFileTxn.fileId = fileId;
            await businessNetworkConnection.submitTransaction(validateFileTxn);
            assert.isTrue(fileValidateEvent.result);            
        }); 

        it('should invalidate the file by checking hash from blockchain', async () => {                
            validateFileTxn = factory.newTransaction(namespace, 'ValidateFileTransaction');
            validateFileTxn.fileHash = fileHash1;
            validateFileTxn.fileId = fileId;
            await businessNetworkConnection.submitTransaction(validateFileTxn);
            assert.isFalse(fileValidateEvent.result);

        }); 
 
    });
    
});
