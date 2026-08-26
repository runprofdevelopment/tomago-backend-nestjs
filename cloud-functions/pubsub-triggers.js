//#region [ Libraries & Resources ]
const functions = require('firebase-functions/v1');
//#endregion

//#region [ Cloud Functions Config ]
const REGION = 'europe-west1';
const TriggersRuntimeOpts = {
  // vpcConnector: 'bitaqatyconnector',
  // vpcConnectorEgressSettings: 'ALL_TRAFFIC',
  timeoutSeconds: 540,
  memory: '2GB',
};

const CloudFunctions = functions.region(REGION).runWith(TriggersRuntimeOpts);
//#endregion

exports.newAuctionRunning = CloudFunctions.pubsub.topic('NEW_AUCTION_RUNNING_TOPIC').onPublish((message) => {
  console.log('Message =', message);
  return message;
});