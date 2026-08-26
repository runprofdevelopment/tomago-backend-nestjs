// Sync Algolia variant records from Firestore product-variants
// Usage: node testScripts/syncAlgoliaFromFirestore.js [variantId]

require('dotenv').config();

const admin = require('firebase-admin');
const path = require('path');

const AlgoliaService = require('../src/services/product/algoliaService');
const FirebaseHelper = require('../src/database/utils/firebaseHelper');
const Variant = new (require('../src/database/models/product-variant'))();

async function initFirebase() {
  if (admin.apps.length) return;
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, '../service-accounts/service-account.json');
  // Fallback to application default credentials if path doesn’t exist
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Falling back to service account file:', serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
    });
  }
}

async function fetchVariant(variantId) {
  const doc = await admin.firestore().collection(Variant.collectionName).doc(variantId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function syncOne(variantId) {
  const variant = await fetchVariant(variantId);
  if (!variant) {
    console.log('Variant not found:', variantId);
    return { variantId, status: 'not_found' };
  }

  // Minimal fields we want Algolia to reflect. Add more if needed.
  const record = {
    price: variant.price,
    sale_price: variant.sale_price,
    current_price: variant.current_price || variant.price,
    inventory_quantity: variant.inventory_quantity || 0,
    max_order_qty: variant.max_order_qty || 0,
    updatedAt: new Date(),
  };

  await AlgoliaService.updateVariant(variantId, record);
  console.log('Synced to Algolia:', variantId, record);
  return { variantId, status: 'synced' };
}

async function syncAll() {
  const snapshot = await admin.firestore().collection(Variant.collectionName).select('price', 'sale_price', 'current_price', 'inventory_quantity', 'max_order_qty').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const id = doc.id;
    const data = doc.data();
    const record = {
      price: data.price,
      sale_price: data.sale_price,
      current_price: data.current_price || data.price,
      inventory_quantity: data.inventory_quantity || 0,
      max_order_qty: data.max_order_qty || 0,
      updatedAt: new Date(),
    };
    await AlgoliaService.updateVariant(id, record);
    count += 1;
    if (count % 50 === 0) console.log(`Synced ${count} variants...`);
  }
  console.log(`Done. Synced ${count} variants.`);
}

(async () => {
  await initFirebase();
  const variantId = process.argv[2];
  if (variantId) {
    await syncOne(variantId);
  } else {
    await syncAll();
  }
  process.exit(0);
})();


