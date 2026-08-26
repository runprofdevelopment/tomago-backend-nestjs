const axios = require('axios');
const qs = require('qs');

/*
 * Test script: create an order via GraphQL and print the response
 * --------------------------------------------------------------
 * Usage:
 *   ADDRESS_ID=<your_address_id> node createOrderAndPay.js
 *
 * Environment variables (all optional):
 *   GRAPHQL_ENDPOINT   – Full URL of the GraphQL endpoint (defaults to staging)
 *   ADDRESS_ID         – Shipping address ID to use **required**
 *   PAYMENT_METHOD     – Payment method (cod | credit | wallet | installment | e_wallet)
 *   USE_WALLET         – true / false (default false)
 *
 * The backend (localhost env) will auto-authenticate with the default test user
 * configured in `backend/config/localhost.js`, so no auth token is needed.
 */

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT ||
  'https://decoopa-staging-166607207334.europe-west3.run.app/graphql';

const ADDRESS_ID = process.env.ADDRESS_ID;
if (!ADDRESS_ID) {
  console.error('❌   ADDRESS_ID environment variable is required');
  process.exit(1);
}

const PAYMENT_METHOD = process.env.PAYMENT_METHOD || 'cod';
const USE_WALLET = String(process.env.USE_WALLET || 'false').toLowerCase() === 'true';

async function createOrder() {
  console.log('▶️  Creating order…');

  const mutation = `
    mutation CREATE($data: OrderInput!) {
      orderCreate(data: $data) {
        paymentInfo {
          paymentMethod
          financialStatus
          hash
          serverWebhook
        }
        order {
          id
          totalPrice
          currency
          partialAmountPaid
        }
      }
    }
  `;

  const variables = {
    data: {
      paymentMethod: PAYMENT_METHOD,
      addressId: ADDRESS_ID,
      useWallet: USE_WALLET,
    },
  };

  try {
    const { data } = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: mutation,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (data.errors) {
      console.error('❌  GraphQL errors:', JSON.stringify(data.errors, null, 2));
      return;
    }

    const result = data.data.orderCreate;
    console.log('✅  Order created successfully!');
    console.log(JSON.stringify(result, null, 2));

    const { paymentInfo, order } = result;

    if (paymentInfo.financialStatus === 'paid' || paymentInfo.paymentMethod === 'cod') {
      console.log('\n🎉 Order is considered **PAID**. No further action required.');
    } else {
      console.log('\n💳 Order is **pending payment**.');
      console.log('   • Use these details to initiate payment on the frontend:');
      console.log(`     - orderId        : ${order.id}`);
      console.log(`     - amount         : ${order.totalPrice - (order.partialAmountPaid || 0)}`);
      console.log(`     - currency       : ${order.currency}`);
      console.log(`     - default method : ${paymentInfo.paymentMethod}`);
      console.log(`     - server webhook : ${paymentInfo.serverWebhook}`);
      console.log('   • For Kashier you would generate a payment URL with the provided hash.');
    }
  } catch (err) {
    if (err.response) {
      console.error('❌  Request failed:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('🚨  Error:', err.message);
    }
  }
}

createOrder(); 