# Basic Sample Business Network

> file-register demo

Steps of creating bna to web app:(customize as required)
*start fabric ->./startFabric.sh
*create bna -> composer archive create -t dir -n .
*install bna -> composer network install --card PeerAdmin@hlfv1 --archiveFile tutorial-network@0.0.1.bna
*start the business network ->composer network start --networkName tutorial-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file PeerAdmin.card
* import business network card -> composer card import --file PeerAdmin.card
*generating angular scaffolding -> yo hyperledger-composer
*start angular app - cd <app dir>; npm start
app ->  http://localhost:4200

Ref - https://hyperledger.github.io/composer/latest/applications/web