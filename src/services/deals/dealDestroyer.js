const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Deal = require('../../database/models/deal');

module.exports = class DealDestroyer {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Deal();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  /**
   * Permanently delete deal type item by ID (Force delete)
   * @param {String} id Deal ID (Required) 
   */
  async destroy(id) {
    try {
      // Get deal and its items before deleting to sync with Algolia
      const deal = await FirebaseHelper.findDocument(this.collectionName, id);
      if (!deal) {
        throw new Error('Deal not found');
      }

      const items = deal.items || [];
      
      // Sync with Algolia to remove deal flags from all products
      if (items.length > 0) {
        await this._syncItemsToAlgolia(items);
      }

      // Delete the deal from Firestore
      const batch = await FirebaseHelper.createBatch();
      await this.repository.destroyDocument(id, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sync items to Algolia when deal is deleted
   * Removes inDeal, dealId, and sets onSale to false
   */
  async _syncItemsToAlgolia(items) {
    try {
      console.log(`🔄 Starting Algolia sync for deal deletion`);
      console.log(`📦 Items to sync:`, items.map(item => ({ productId: item.productId, variantId: item.variantId })));

      const AlgoliaService = require('../product/algoliaService');
      
      // Remove deal flags from all items
      const updateData = { 
        inDeal: false, 
        dealId: null, 
        onSale: false 
      };
      console.log(`🗑️ Deal deletion: Removing deal flags from variants`);

      // Update each variant in Algolia
      for (const item of items) {
        try {
          const variantId = item.variantId || item.variant_id || item.id;
          if (!variantId) {
            console.warn(`⚠️ Skipping item without variantId:`, item);
            continue;
          }
          
          console.log(`🔄 Updating variant ${variantId} with data:`, updateData);
          await AlgoliaService.updateVariant(variantId, updateData);
          console.log(`✅ Algolia sync: Updated variant ${variantId} successfully`);
        } catch (variantError) {
          console.error(`❌ Failed to update variant ${item.variantId || item.id}:`, variantError);
          // Don't throw here, continue with other variants
        }
      }
      
      console.log(`🎉 Algolia sync completed for deal deletion`);
    } catch (error) {
      console.error(`❌ Failed to sync items to Algolia on deal deletion:`, error);
      // Don't throw error to avoid breaking the main operation
    }
  }
};