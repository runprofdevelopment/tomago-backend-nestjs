#!/usr/bin/env node
/**
 * Backfill soft-delete fields and migrate legacy category isRemoved flags.
 *
 * Usage:
 *   NODE_ENV=staging node scripts/migrate-soft-delete.js
 *   NODE_ENV=staging node scripts/migrate-soft-delete.js --dry-run
 */

const admin = require('../src/infrastructure/firebaseInit');
const { parseArgs, assertEnvAllowed } = require('./seed/config');

const BATCH_LIMIT = 450;

const COLLECTIONS = [
  'brand',
  'collection',
  'category',
  'product',
  'product-variants',
  'variants_options',
  'inventory',
  'project',
  'showRoom',
  'slider',
  'staticPages',
  'voucher',
  'user',
  'customerSettings',
  'paymentMethod',
  'order',
  'customRequest',
  'returnRequest',
  'addresses',
  'ads',
  'deal',
  'notification',
  'reviews',
  'contactUs',
  'cart',
  'wallet',
  'transaction',
  'withdrawalRequest',
  'shipment',
  'invoice',
  'timeline',
  'settings',
  'OTP-code',
  'topBanner',
  'videoAd',
  'ad-containers',
  'decoopa-account',
];

function buildUpdates(data) {
  const updates = {};

  if (data.isRemoved === true && data.deletedAt == null) {
    updates.deletedAt = data.updatedAt || admin.firestore.FieldValue.serverTimestamp();
    updates.deletedBy = data.updatedBy || data.createdBy || null;
  } else if (data.deletedAt === undefined) {
    updates.deletedAt = null;
    updates.deletedBy = null;
  } else if (data.deletedBy === undefined) {
    updates.deletedBy = null;
  }

  if ('isRemoved' in data) {
    updates.isRemoved = admin.firestore.FieldValue.delete();
  }

  return updates;
}

async function flushBatch(batch, pendingCount, dryRun) {
  if (!pendingCount || dryRun) {
    return;
  }

  await batch.commit();
}

async function migrateCollection(collectionName, dryRun) {
  const snapshot = await admin.firestore().collection(collectionName).get();
  let updated = 0;
  let batch = admin.firestore().batch();
  let pending = 0;

  for (const doc of snapshot.docs) {
    const updates = buildUpdates(doc.data());

    if (!Object.keys(updates).length) {
      continue;
    }

    updated += 1;

    if (!dryRun) {
      batch.update(doc.ref, updates);
      pending += 1;

      if (pending >= BATCH_LIMIT) {
        await flushBatch(batch, pending, dryRun);
        batch = admin.firestore().batch();
        pending = 0;
      }
    }
  }

  await flushBatch(batch, pending, dryRun);

  return {
    scanned: snapshot.size,
    updated,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  assertEnvAllowed(args);

  console.log(`Soft delete migration (${args.dryRun ? 'dry-run' : 'live'})`);

  const summary = [];

  for (const collectionName of COLLECTIONS) {
    try {
      const result = await migrateCollection(collectionName, args.dryRun);
      summary.push({ collectionName, ...result });
      console.log(
        `[${collectionName}] scanned=${result.scanned} updated=${result.updated}`,
      );
    } catch (error) {
      console.error(`[${collectionName}] failed:`, error.message);
      summary.push({ collectionName, error: error.message });
    }
  }

  const totalUpdated = summary.reduce(
    (acc, item) => acc + (item.updated || 0),
    0,
  );

  console.log(`Done. Updated ${totalUpdated} documents across ${COLLECTIONS.length} collections.`);

  if (args.dryRun) {
    console.log('Dry run only — no documents were written.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
