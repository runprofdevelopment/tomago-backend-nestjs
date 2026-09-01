#!/usr/bin/env node

const admin = require('firebase-admin');
const FirebaseHelper = require('../src/database/utils/firebaseHelper');
const Order = require('../src/database/models/order');
const Variant = require('../src/database/models/product-variant');

async function main() {
  const serviceAccount = require('../service-accounts/production.json');
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  const orderModel = new Order();
  const variantModel = new Variant();

  console.log('=== Integration test against production Firestore ===\n');

  const dateFilter = [
    { field: 'createdAt', operator: 'greaterEqual', value: '2020-01-01T00:00:00Z' },
    { field: 'createdAt', operator: 'lessEqual', value: '2026-12-31T23:59:59Z' },
  ];

  const orders = await FirebaseHelper.listWithPagination({
    collectionPath: orderModel.collectionName,
    filter: dateFilter,
    sort: [{ field: 'createdAt', order: 'desc' }],
    pagination: { limit: 5, page: 1, action: 'current' },
    queryType: 'single',
  });

  console.log('orderList date range:');
  console.log(`  rows: ${orders.rows.length}, count: ${orders.count}`);
  if (orders.rows[0]) {
    console.log(`  sample: ${orders.rows[0].id} createdAt=${orders.rows[0].createdAt}`);
  }
  console.log(`  result: ${orders.rows.length > 0 ? 'PASS' : 'FAIL'}\n`);

  const archivedFilter = [{ field: 'status', operator: 'equal', value: 'archived' }];
  const archived = await FirebaseHelper.listWithPagination({
    collectionPath: variantModel.collectionName,
    filter: archivedFilter,
    sort: [{ field: 'createdAt', order: 'desc' }],
    pagination: { limit: 5, page: 1, action: 'current' },
    queryType: 'single',
  });

  console.log('inventoryList archived filter (no default status exclusion):');
  console.log(`  rows: ${archived.rows.length}, count: ${archived.count}`);
  if (archived.rows[0]) {
    console.log(`  sample: ${archived.rows[0].id} status=${archived.rows[0].status}`);
  }
  const allArchived = archived.rows.every((r) => r.status === 'archived');
  const archivedOk = archived.rows.length === 0 || allArchived;
  console.log(`  result: ${archivedOk ? 'PASS' : 'FAIL'}\n`);

  const defaultInventory = await FirebaseHelper.listWithPagination({
    collectionPath: variantModel.collectionName,
    filter: [
      { field: 'status', operator: 'in', value: ['active', 'inactive', 'draft'] },
    ],
    sort: [{ field: 'createdAt', order: 'desc' }],
    pagination: { limit: 5, page: 1, action: 'current' },
    queryType: 'single',
  });
  console.log('inventory default (active/inactive/draft):');
  console.log(`  rows: ${defaultInventory.rows.length}`);
  console.log(`  result: ${defaultInventory.rows.length > 0 ? 'PASS' : 'WARN (no data)'}\n`);

  const ok = orders.rows.length > 0 && archivedOk;
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
