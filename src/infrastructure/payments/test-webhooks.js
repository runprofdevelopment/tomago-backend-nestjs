const App = require('../../../app');
App.init();  // Initializes Firebase Authentication

const _ = require('underscore');
const Kashier = require('./kashier');
// const qs = require('qs');
// require('dotenv').config({ path: `../../../.env.staging` });
// const { KASHIER_API_KEY, KASHIER_SECRET_KEY, KASHIER_MID, KASHIER_BASE_URL } = process.env;
const { handleOrderPaymentWebhook } = require('../../services/order/handleOrderPaymentWebhook');


async function testWebhook(docId) {
  console.log('\n============================================= START RUNNING FAWATERK WEBHOOK =============================================');

  const FirebaseHelper = require('../../database/utils/firebaseHelper');
  const record = await FirebaseHelper.findDocument('test-webhook', docId);
  const payload = record.payload;
  const signature = "e1037b4a38fa7bdbe104493929415cde2062c617576d30d3373944274a455319";

  const { data, event } = payload;
  console.log({ body: payload });
  console.log({ signature });

  try {
    data.signatureKeys.sort();
    const objectSignaturePayload = _.pick(data, data.signatureKeys);
    const isValidSignature = Kashier.validateSignature(signature, objectSignaturePayload);
 
    if (!isValidSignature) {
      throw new Error('Invalid Kashier webhook signature');
    }
    console.log('valid signature');

    await handleOrderPaymentWebhook(data);
  } catch (error) {
    console.log(error);
  }
}

testWebhook('CFaEFmx2JRK7Qtnu10Xq');