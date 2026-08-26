// const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Deal = require('../../database/models/deal');

module.exports = class DealItemsEditor {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Deal()
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async addItemsToDeal(id, items) {
    try {
      await this._validate(id, items);

      const fields = [{
        fieldName: 'items',
        fieldValues: items
      }];

      const batch = await FirebaseHelper.createBatch();
      await FirebaseHelper.appendItemsToArrayField(this.collectionName, id, fields, {
        batch: batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);

      // Sync with Algolia after successful database update
      await this._syncItemsToAlgolia(id, items, 'add');
    } catch (error) {
      if (error.code === 5) throw new Error(`Deal not found`);
      throw error;
    }
  }

  async removeItemsFromDeal(id, items = []) {
    try {
      await this._validate(id, items);

      const fields = [{
        fieldName: 'items',
        fieldValues: items
      }];

      const batch = await FirebaseHelper.createBatch();
      await FirebaseHelper.removeItemsFromArrayField(this.collectionName, id, fields, {
        batch: batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);

      // Sync with Algolia after successful database update
      await this._syncItemsToAlgolia(id, items, 'remove');
    } catch (error) {
      throw error;
    }
  }


  // async removeItemsFromDeal(id, indexOfItems = []) {
  //   try {
  //     // await this._validate(id, indexOfItems);
  //     if (!id) throw new Error(`id is Required`);
  //     const deal = await FirebaseHelper.findDocument(this.collectionName, id);
  //     const items = deal?.items || [];


  //     // Sort the indexes in descending order
  //     indexOfItems.sort((a, b) => b - a);

  //     // Remove the items at the specified indexes
  //     for (const index of indexOfItems) {
  //       if (index > -1) items.splice(index, 1);
  //     }

  //     const batch = await FirebaseHelper.createBatch();
  //     await this.repository.updateDocument(id, { items }, {
  //       batch,
  //       currentUser: this.currentUser,
  //       language: this.language,
  //     });
  //     await FirebaseHelper.commitBatch(batch);
  //   } catch (error) {
  //     if (error.code === 5) throw new Error(`Deal not found`);
  //     throw error;
  //   }
  // }

  async _syncItemsToAlgolia(dealId, items, action) {
    try {
      console.log(`🔄 Starting Algolia sync for ${action} action on deal ${dealId}`);
      console.log(`📦 Items to sync:`, items.map(item => ({ productId: item.productId, variantId: item.variantId })));

      const AlgoliaService = require('../product/algoliaService');
      
      // For remove action, we don't need deal info, just clear the fields
      let updateData;
      if (action === 'remove') {
        updateData = { 
          inDeal: false, 
          dealId: null, 
          onSale: false 
        };
        console.log(`🗑️ Remove action: Setting onSale=false for variants`);
      } else {
        // Get deal information for add action
        const deal = await FirebaseHelper.findDocument(this.collectionName, dealId);
        if (!deal) {
          console.warn(`Deal ${dealId} not found for Algolia sync`);
          return;
        }

        // Prepare deal information for Algolia
        const dealInfo = {
          dealId: deal.id,
          dealName: deal.name,
          discountType: deal.discountType,
          discountAmount: deal.discountAmount,
          currency: deal.currency,
          ribbonName: deal.ribbonName,
          ribbonColor: deal.ribbonColor,
          ribbonBackground: deal.ribbonBackground,
          dealStatus: deal.status,
          startDate: deal.startDate,
          endDate: deal.endDate,
        };

        updateData = { ...dealInfo, inDeal: true, onSale: true };
        console.log(`➕ Add action: Setting onSale=true for variants`);
      }

      // Update each variant in Algolia
      for (const item of items) {
        try {
          console.log(`🔄 Updating variant ${item.variantId} with data:`, updateData);
          const result = await AlgoliaService.updateVariant(item.variantId, updateData);
          console.log(`✅ Algolia sync ${action}: Updated variant ${item.variantId} successfully`);
        } catch (variantError) {
          console.error(`❌ Failed to update variant ${item.variantId}:`, variantError);
          // Don't throw here, continue with other variants
        }
      }
      
      console.log(`🎉 Algolia sync ${action} completed for deal ${dealId}`);
    } catch (error) {
      console.error(`❌ Failed to sync ${action} items to Algolia for deal ${dealId}:`, error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  async _validate(id, items) {
    if (!id) throw new Error(`id is Required`);
    if (!items || !items?.length) throw new Error(`items is Required`);

    items.forEach((item, index) => {
      if (!item.productId) throw new Error(`productId of item #[${index+1}] is Required`);
      if (!item.variantId) throw new Error(`variantId of item #[${index+1}] is Required`);
    });
  }
}