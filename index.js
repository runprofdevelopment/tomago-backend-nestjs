/* 
 * ╭──────────────────────────────────────────────────────────────────────────────────────╮
 * │                     Configures Firebase Functions to use the API                     │
 * ╰──────────────────────────────────────────────────────────────────────────────────────╯
 */
//#region [ Libraries ]
const App = require('./app');
App.init();  // Initializes Firebase Authentication

// const functions = require('firebase-functions');
// const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require('firebase-functions/v2');


const REGION = 'europe-west3';
const runtimeOpts = {
  '2GB_1Min': {
    enforceAppCheck: true,       // Reject requests with missing or invalid App Check tokens.
    // consumeAppCheckToken: true,  // Consume the token after verification.
    timeoutSeconds: 60,
    memory: '2GB',
  },
  '4GB_1Min': {
    enforceAppCheck: true,       // Reject requests with missing or invalid App Check tokens.
    // consumeAppCheckToken: true,  // Consume the token after verification.
    timeoutSeconds: 60,
    memory: '4GB',
  },
  '8GB_1Min': {
    enforceAppCheck: true,       // Reject requests with missing or invalid App Check tokens.
    // consumeAppCheckToken: true,  // Consume the token after verification.
    timeoutSeconds: 60,
    memory: '8GB',
  },
  '8GB_9Min': {
    timeoutSeconds: 540,
    memory: '8GB',
    // enforceAppCheck: true,       // Reject requests with missing or invalid App Check tokens.
    // consumeAppCheckToken: true,  // Consume the token after verification.
  }
};
//#endregion

// Locate all functions closest to users
// setGlobalOptions({ region: REGION });

// Set global options with both region and runtime options
setGlobalOptions({
  region: REGION,
  ...runtimeOpts['8GB_9Min'],
});

/** Cloud Firestore Function Triggers */
exports.triggers = require('./cloud-functions/firestore-triggers');

/** Scheduled Cloud Pub/Sub */
exports.schedule = require('./cloud-functions/schedule-functions');

const KashierWebhooks = require('./src/infrastructure/payments/kashier-webhooks');
exports.webhooks = {
  order: onRequest(runtimeOpts['8GB_9Min'], KashierWebhooks),
  wallet: onRequest(runtimeOpts['8GB_9Min'], KashierWebhooks),
}