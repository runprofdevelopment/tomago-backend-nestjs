const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AlgoliaService = require('../product/algoliaService');
const ProductPricingModifier = require('../product/productPricingModifier');
const Variant = new (require('../../database/models/product-variant'));

module.exports = class InventoryEditor {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(Variant.collectionName);
  }

  async updateQuantityOrPrice(variant_id, data) {
    try {
      this._validate(data);

      let record = {};
      if (data && data.price && data.price >= 0) record['price'] = data.price;
      if (data  && data?.quantity >= 0) record['inventory_quantity'] = data.quantity;
      // record['inventory_quantity'] = data.quantity;
      if (data && data.max_order_qty && data.max_order_qty >= 0) record['max_order_qty'] = data.max_order_qty;

      if ('price' in record) {
        const pricing = await ProductPricingModifier.adjustPricing(variant_id, data);
        record = { ...record, ...pricing };
      }
      
      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(variant_id, record, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);

      await AlgoliaService.updateVariant(variant_id, {
        ...record,
        updatedBy: this.currentUser.id,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  _validate(data) {
    if ('price' in data && data.price < 0) throw new Error(`price must be greater than or equal to 0`);
    if (data.inventory_quantity && data.inventory_quantity < 0) throw new Error(`inventory_quantity must be greater than or equal to 0`);
    if ('max_order_qty' in data && data.max_order_qty < 0) throw new Error(`max_order_qty must be greater than or equal to 0`);
  }
};