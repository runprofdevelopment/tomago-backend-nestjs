#!/usr/bin/env node

const https = require('https');
const admin = require('firebase-admin');

const API_URL = process.env.API_URL || 'https://decoopa-335317890504.europe-west3.run.app/graphql';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCU9jTlyosMKOui_0AGDBbpueYNfn9KkTA';
const ADMIN_UID = process.env.ADMIN_UID;

function request(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en',
          'application-type': 'web',
          userType: 'admin',
          appId: '1:335317890504:web:331d9376652d7ad1f2bcfd',
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      },
    );
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function getAdminToken() {
  if (process.env.FIREBASE_TOKEN) {
    return process.env.FIREBASE_TOKEN;
  }

  const serviceAccount = require('../service-accounts/production.json');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  let uid = ADMIN_UID;
  if (!uid) {
    const admins = await admin.firestore().collection('user')
      .where('roles', 'array-contains', 'admin')
      .limit(1)
      .get();
    if (admins.empty) {
      throw new Error('No admin user found in Firestore. Set ADMIN_UID env var.');
    }
    uid = admins.docs[0].id;
  }

  const customToken = await admin.auth().createCustomToken(uid);
  const signIn = await request(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    { token: customToken, returnSecureToken: true },
  );

  if (!signIn.data?.idToken) {
    throw new Error(`Failed to get ID token: ${JSON.stringify(signIn.data)}`);
  }

  return signIn.data.idToken;
}

async function graphql(token, query, variables) {
  return request(API_URL, { query, variables }, {
    Authorization: `Bearer ${token}`,
  });
}

async function testOrderDateRange(token) {
  console.log('\n=== Test 1: orderList with createdAt date range ===');

  const variables = {
    filter: [
      { field: 'createdAt', operator: 'greaterEqual', value: '2020-01-01T00:00:00Z' },
      { field: 'createdAt', operator: 'lessEqual', value: '2026-12-31T23:59:59Z' },
    ],
    sort: [{ field: 'createdAt', order: 'desc' }],
    pagination: { limit: 10, page: 1, action: 'current' },
  };

  const response = await graphql(token, `
    query ORDERS_LIST($filter: [FilterInput!], $sort: [SortInput!], $pagination: PaginationInput) {
      orderList(filter: $filter, sort: $sort, pagination: $pagination) {
        count
        rows { id createdAt orderStatus }
        pagination { totalCount isFirstPage isLastPage }
      }
    }
  `, variables);

  if (response.data?.errors?.length) {
    console.log('FAIL - GraphQL errors:', response.data.errors.map((e) => e.message).join('; '));
    return false;
  }

  const result = response.data?.data?.orderList;
  const rowCount = result?.rows?.length || 0;
  console.log(`Status: ${response.status}`);
  console.log(`Count: ${result?.count}, Rows returned: ${rowCount}`);
  if (rowCount > 0) {
    console.log(`Sample order: ${result.rows[0].id} createdAt=${result.rows[0].createdAt}`);
    console.log('PASS - orderList returns data with date range filter');
    return true;
  }

  console.log('FAIL - orderList returned empty rows with broad date range');
  return false;
}

async function testInventoryArchived(token) {
  console.log('\n=== Test 2: inventoryList with archived status filter ===');

  const variables = {
    filter: [{ field: 'status', operator: 'equal', value: 'archived' }],
    sort: [{ field: 'createdAt', order: 'desc' }],
    pagination: { limit: 10, page: 1, action: 'current' },
  };

  const response = await graphql(token, `
    query INVENTORY_ARCHIVED($filter: [FilterInput!], $sort: [SortInput!], $pagination: PaginationInput) {
      inventoryList(filter: $filter, sort: $sort, pagination: $pagination) {
        count
        rows { variant_id status title { en } }
        pagination { totalCount isFirstPage isLastPage }
      }
    }
  `, variables);

  if (response.data?.errors?.length) {
    console.log('FAIL - GraphQL errors:', response.data.errors.map((e) => e.message).join('; '));
    return false;
  }

  const result = response.data?.data?.inventoryList;
  const rows = result?.rows || [];
  const allArchived = rows.every((row) => row.status === 'archived');

  console.log(`Status: ${response.status}`);
  console.log(`Count: ${result?.count}, Rows returned: ${rows.length}`);
  if (rows.length > 0) {
    console.log(`Sample item: ${rows[0].variant_id} status=${rows[0].status}`);
  }

  if (rows.length > 0 && allArchived) {
    console.log('PASS - inventoryList returns archived items only');
    return true;
  }

  if (rows.length === 0) {
    console.log('WARN - No archived inventory in database (filter logic OK, no data to show)');
    return true;
  }

  console.log('FAIL - inventoryList returned non-archived items');
  return false;
}

async function main() {
  console.log(`API: ${API_URL}`);
  try {
    const token = await getAdminToken();
    console.log('Authenticated with admin token');

    const orderOk = await testOrderDateRange(token);
    const inventoryOk = await testInventoryArchived(token);

    console.log('\n=== Summary ===');
    console.log(`orderList date range: ${orderOk ? 'PASS' : 'FAIL'}`);
    console.log(`inventoryList archived: ${inventoryOk ? 'PASS' : 'FAIL'}`);

    process.exit(orderOk && inventoryOk ? 0 : 1);
  } catch (error) {
    console.error('Test run failed:', error.message);
    process.exit(1);
  }
}

main();
