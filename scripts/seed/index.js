#!/usr/bin/env node
/**
 * Firestore relational seed — staging/localhost only by default.
 *
 * Usage:
 *   NODE_ENV=staging node scripts/seed/index.js
 *   NODE_ENV=staging node scripts/seed/index.js --dry-run
 *   NODE_ENV=staging node scripts/seed/index.js --clear-seed
 *   NODE_ENV=staging node scripts/seed/index.js --with-auth
 */

const path = require('path');
const admin = require('firebase-admin');
const { parseArgs, assertEnvAllowed, SEED_PREFIX } = require('./config');
const { SEED_COLLECTIONS } = require('./order');
const FirestoreSeedWriter = require('./writers/firestore');
const { buildCatalogDatasets } = require('./datasets/catalog');
const { buildCmsDatasets } = require('./datasets/cms');
const {
  buildUserDatasets,
  CUSTOMER_EMAIL,
  ADMIN_EMAIL,
} = require('./datasets/users');

const { getFirestore } = require('firebase-admin/firestore');

function getFirestoreDb(app, config) {
  const databaseId = config.databaseId || 'default';
  const db = getFirestore(app, databaseId);
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

async function assertFirestoreReady(db, { useEmulator }) {
  try {
    await db.collection('_seed_preflight').limit(1).get();
    return true;
  } catch (err) {
    if (useEmulator) {
      throw new Error(
        `Firestore emulator not reachable. Start it with: firebase emulators:start --only firestore\n` +
          `Then run: npm run seed:firestore:emulator`,
      );
    }
    throw new Error(
      `Firestore is not available on this project (NOT_FOUND).\n` +
        `Enable Firestore in Firebase Console, or use the local emulator:\n` +
        `  firebase emulators:start --only firestore\n` +
        `  npm run seed:firestore:emulator`,
    );
  }
}

function initFirebase(env, args) {
  const config = require(path.join(__dirname, '../../config'))();

  if (args.useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = args.emulatorHost;
    if (args.withAuth) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    }
  }

  const accountName = env === 'development' ? 'localhost' : env;
  const serviceAccountPath = path.join(
    __dirname,
    '../../service-accounts',
    `${accountName}.json`,
  );

  let serviceAccount;
  try {
    serviceAccount = require(serviceAccountPath);
  } catch (e) {
    serviceAccount = require(path.join(__dirname, '../../service-accounts/staging.json'));
  }

  const projectId = args.useEmulator
    ? 'tomago-seed-emulator'
    : serviceAccount.project_id;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
      storageBucket: (config.storageBucketName || '').replace(/^gs:\/\//, ''),
      databaseURL: config.firebaseConfig?.databaseURL,
    });
  }

  const app = admin.app();
  const db = getFirestoreDb(app, config, args);

  return { config: { ...config, projectId }, db, useEmulator: args.useEmulator };
}

async function ensureAuthUsers(users, { dryRun, withAuth }) {
  if (!withAuth) {
    console.log('Skipping Firebase Auth (--with-auth not set)');
    return;
  }

  for (const userDoc of users) {
    if (!userDoc.auth) continue;
    const { email, password, displayName } = userDoc.auth;

    if (dryRun) {
      console.log(`  [dry-run] auth create/update ${email}`);
      continue;
    }

    try {
      const existing = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(existing.uid, {
        password,
        displayName,
        emailVerified: true,
      });
      console.log(`  Auth updated: ${email} (${existing.uid})`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        const created = await admin.auth().createUser({
          uid: userDoc.id,
          email,
          password,
          displayName,
          emailVerified: true,
        });
        console.log(`  Auth created: ${email} (${created.uid})`);
      } else if (err.code === 'auth/configuration-not-found') {
        console.warn(
          '  Auth skipped: Firebase Authentication not enabled on this project.',
        );
        break;
      } else {
        throw err;
      }
    }
  }
}

async function writeFlatDocs(writer, docs) {
  for (const doc of docs) {
    await writer.queueSet(doc.collection, doc.id, doc.data);
  }
}

async function writeSubDocs(writer, docs) {
  for (const doc of docs) {
    const ref = writer.subRef(
      doc.parentCollection,
      doc.parentId,
      doc.subCollection,
      doc.id,
    );
    await writer.queueSetOnRef(ref, doc.id, doc.data);
  }
}

async function verifyRelations(db) {
  const checks = [];

  const project = await db.collection('project').doc('seed_project_bosphorus_hotel').get();
  if (project.exists) {
    const fp = project.data().featured_product_ids || [];
    for (const pid of fp) {
      const p = await db.collection('product').doc(pid).get();
      checks.push({ rel: `project → product (${pid})`, ok: p.exists });
    }
  }

  const category = await db.collection('category').doc('seed_category_sofas').get();
  if (category.exists) {
    const cid = category.data().collection_id;
    const col = await db.collection('collection').doc(cid).get();
    checks.push({ rel: `category → collection (${cid})`, ok: col.exists });
  }

  const order = await db.collection('order').doc('seed_order_csr_2024_0832').get();
  if (order.exists) {
    const item = (order.data().items || [])[0];
    if (item) {
      const p = await db.collection('product').doc(item.productId).get();
      checks.push({ rel: `order → product (${item.productId})`, ok: p.exists });
    }
  }

  return checks;
}

async function main() {
  const args = parseArgs(process.argv);
  const env = assertEnvAllowed(args);

  console.log('\n=== Tomoga Firestore Seed ===');
  console.log(`Environment: ${env}`);
  console.log(`Dry run: ${args.dryRun}`);
  console.log(`Clear seed first: ${args.clearSeed}`);
  console.log(`Create Auth users: ${args.withAuth}\n`);

  const { config, db, useEmulator } = initFirebase(env, args);
  console.log(`Project: ${config.projectId || config.env}`);
  if (useEmulator) {
    console.log(`Firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  }
  console.log('');

  if (!args.dryRun) {
    await assertFirestoreReady(db, { useEmulator });
  }

  const writer = new FirestoreSeedWriter({ dryRun: args.dryRun, prefix: SEED_PREFIX, db });

  if (args.clearSeed) {
    console.log('Clearing existing seed documents...');
    await writer.clearSeedDocuments(SEED_COLLECTIONS);
    await writer.clearSeedSubcollections('user', 'addresses');
    console.log('');
  }

  const catalog = buildCatalogDatasets();
  const cms = buildCmsDatasets();
  const userData = buildUserDatasets();

  console.log('Seeding catalog (brands → collections → categories → products)...');
  await writeFlatDocs(writer, catalog);

  console.log('Seeding CMS (projects, showrooms, sliders, static pages, vouchers)...');
  await writeFlatDocs(writer, cms);

  console.log('Seeding users...');
  await ensureAuthUsers(userData.users, args);
  await writeFlatDocs(writer, userData.users.map(({ collection, id, data }) => ({ collection, id, data })));

  console.log('Seeding addresses (subcollection)...');
  await writeSubDocs(writer, userData.addresses);

  console.log('Seeding customer settings & payment methods...');
  await writeFlatDocs(writer, userData.customerSettings);
  await writeFlatDocs(writer, userData.paymentMethods);

  console.log('Seeding orders, custom & return requests...');
  await writeFlatDocs(writer, userData.orders);
  await writeFlatDocs(writer, userData.customRequests);
  await writeFlatDocs(writer, userData.returnRequests);

  const stats = await writer.finish();

  console.log('\n=== Seed complete ===');
  console.log(`Written: ${stats.written} | Deleted: ${stats.deleted} | Dry-run skipped: ${stats.skipped}`);

  if (!args.dryRun) {
    console.log('\nVerifying key relations...');
    const checks = await verifyRelations(db);
    checks.forEach(({ rel, ok }) => {
      console.log(`  ${ok ? '✓' : '✗'} ${rel}`);
    });
  }

  console.log('\nDemo credentials (when --with-auth):');
  console.log(`  Customer: ${CUSTOMER_EMAIL}`);
  console.log(`  Admin:    ${ADMIN_EMAIL}`);
  console.log('');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  if (err.code === 5 || err.message.includes('NOT_FOUND')) {
    console.error(
      '\nHint: Firestore may not be enabled on this project, or the service account lacks access.',
    );
    console.error('Dry-run succeeded locally — run against a project with Firestore enabled.');
  }
  console.error(err);
  process.exit(1);
});
