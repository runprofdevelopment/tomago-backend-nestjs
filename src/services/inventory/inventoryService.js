const FirebaseHelper = require('../../database/utils/firebaseHelper');
const admin = require('firebase-admin');

module.exports = class InventoryService {
  constructor(context) {
    this.ctx = context;
  }

  async validateStockAvailability(items) {
    if (!items || !Array.isArray(items)) {
      return;
    }

    for (const item of items) {
      // Check in product-variants collection where inventory_quantity is stored
      const variantRef = FirebaseHelper.getFirestoreDocumentRef('product-variants', item.variantId);
      const variantDoc = await variantRef.get();

      if (!variantDoc.exists) {
        throw new Error(`Product variant not found in inventory: ${item.variantId}`);
      }

      const currentStock = variantDoc.data().inventory_quantity || 0;
      
      if (item.quantity > currentStock) {
        throw new Error(`Not enough stock for product variant: ${item.variantId} (requested: ${item.quantity}, available: ${currentStock})`);
      }
    }
  }

  async decrementOnOrderPlacement(order, batch) {
    if (!order || !order.items || !Array.isArray(order.items)) {
      return;
    }

    for (const item of order.items) {
      // Update inventory in product-variants collection where inventory_quantity is stored
      const variantRef = FirebaseHelper.getFirestoreDocumentRef('product-variants', item.variantId);
      const variantDoc = await variantRef.get();

      if (variantDoc.exists) {
        const currentStock = variantDoc.data().inventory_quantity || 0;
        const newStock = currentStock - item.quantity;

        if (newStock < 0) {
          throw new Error(`Not enough stock for product variant: ${item.variantId} (requested: ${item.quantity}, available: ${currentStock})`);
        }

        batch.update(variantRef, { inventory_quantity: newStock });
        // Also update Algolia so search reflects live stock
        try {
          const AlgoliaService = require('../product/algoliaService');
          await AlgoliaService.updateVariant(item.variantId, {
            inventory_quantity: newStock,
            updatedAt: new Date(),
          });
        } catch (e) { /* non-fatal */ }
      } else {
        throw new Error(`Product variant not found in inventory: ${item.variantId}`);
      }
    }
  }

  async incrementOnOrderCancellation(order, batch) {
    if (!order || !order.items || !Array.isArray(order.items)) {
      return;
    }

    for (const item of order.items) {
      // Update inventory in product-variants collection where inventory_quantity is stored
      const variantRef = FirebaseHelper.getFirestoreDocumentRef('product-variants', item.variantId);
      const inc = admin.firestore.FieldValue.increment(item.quantity);
      batch.set(variantRef, { inventory_quantity: inc }, { merge: true });
      // Best-effort: read current stock after commit via caller’s flow; here update Algolia optimistically
      try {
        const AlgoliaService = require('../product/algoliaService');
        const snap = await variantRef.get();
        const cur = (snap.exists ? (snap.data().inventory_quantity || 0) : 0) + item.quantity;
        await AlgoliaService.updateVariant(item.variantId, {
          inventory_quantity: cur,
          updatedAt: new Date(),
        });
      } catch (e) { /* non-fatal */ }
    }
  }
}; 