const path = require('path');
const { CloudTasksClient } = require('@google-cloud/tasks');
const config = require('../../../config')();
const serviceAccount = require(`../../../service-accounts/${config.env}.json`);

exports.serviceAccountEmail = serviceAccount.client_email;
exports.project = serviceAccount.project_id;
exports.queue = 'cancel-pending-payment-queue';
exports.location = 'europe-west3';
exports.baseUrl = config.baseUrl;

exports.client = new CloudTasksClient({
  // keyFilename: serviceAccount,
  keyFilename: path.join(__dirname, `../../../service-accounts/${config.env}.json`),
});