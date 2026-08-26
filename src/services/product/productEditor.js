const moment = require('moment');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const AlgoliaService = require('./algoliaService');
const ProductUtils = require('./productUtils');
const ProductPricingModifier = require('./productPricingModifier');
const Product = new (require('../../database/models/product'));
const Variant = new (require('../../database/models/product-variant'));

module.exports = class ProductEditor {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(Variant.collectionName);
  }

  async update(variant_id, data) {
    try {
      data = await this._preSave(variant_id, data);
      
      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(variant_id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);

      await AlgoliaService.updateVariant(variant_id, {
        ...data,
        updatedBy: this.currentUser.id,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async _preSave(variant_id, data) {
    const model = {
      ...Product.cast(data),
      ...Variant.cast(data),
    }
    Object.keys(model).forEach(key => {
      if (!(key in data)) delete model[key];
    });
    data = model;

    if (data && data.title) {
      data['normalize_titleEn'] = HelperFunctions.stringNormalization(data.title, 'en');
      data['normalize_titleAr'] = HelperFunctions.stringNormalization(data.title, 'ar');
    }

    // if (data && data.variant_images) {
    //   const main_image = this._selectMainImageUrl(variant.variant_images);
    // }

    const variant = await this.repository.findDocumentById(variant_id);

    await this._validate(data, variant);
    const pricing = await ProductPricingModifier.adjustPricing(variant_id, data);
    return { ...data, ...pricing };
  }

  async _validate(data, currentVariant) {
    if ('price' in data && data.price < 0) throw new Error(`price must be greater than or equal to 0`);
    if ('cost' in data && data.cost < 0) throw new Error(`cost must be greater than or equal to 0`);
    if ('inventory_quantity' in data && data.inventory_quantity < 0) throw new Error(`inventory_quantity must be greater than or equal to 0`);
    if ('max_order_qty' in data && data.max_order_qty < 0) throw new Error(`max_order_qty must be greater than or equal to 0`);
    if ('sale_price' in data && data.sale_price < 0) throw new Error(`sale_price must be greater than or equal to 0`);
    
    if ('sale_price' in data) {
      const dateNow = moment().format('YYYY-MM-DD');
      const saleStartDate = HelperFunctions.isDate(data.sale_start_date) ? moment(data.sale_start_date).format('YYYY-MM-DD') : null;
      const saleEndDate = HelperFunctions.isDate(data.sale_end_date) ? moment(data.sale_end_date).format('YYYY-MM-DD') : null;
  
      // if (!saleStartDate) throw new Error(`A sale price has been entered. Please provide a valid sale_start_date in the format YYYY-MM-DD.`);
      // if (!saleEndDate) throw new Error(`A sale price has been entered. Please provide a valid sale_end_date in the format YYYY-MM-DD.`);

      // if (saleStartDate < dateNow) {
      //   throw new Error(`Invalid "sale_start_date", cannot "sale_start_date" on this date ${moment(saleStartDate).format('YYYY-MM-DD')}`);
      // }

      
      // if (saleStartDate >= saleEndDate) {
      //   throw new Error(`The "sale_start_date" must be earlier than the "sale_end_date". Please ensure that the selected "sale_start_date" date is before the "sale_end_date".`);
      // }
    }

    if ('sku' in data && data.sku !== currentVariant.sku) {
      if (!data.sku) throw new Error(`sku is Required`);

      const isSksUsed = await ProductUtils.verifySkuUsage(data.sku);
      if (isSksUsed) {
        throw new Error(`The sku: "${data.sku}" is already in use by an existing item. Each item must have a unique sku.`);
      }
    }
    
    if ('barcodes' in data) {
      if (!data.barcodes.length) throw new Error(`barcodes is Required`);

      const duplicates_barcodes = ProductUtils.findDuplicates(data.barcodes);
      if (duplicates_barcodes.length) {
        throw new Error(`The barcodes: "${duplicates_barcodes.join(', ')}" are duplicated. Each item must have a unique barcode.`);
      }

      for (const barcode of data.barcodes) {
        if (!currentVariant?.barcodes?.includes(barcode)) { // Check barcode is elrady existing in the pervious variant
          const isBarcodeUsed = await ProductUtils.verifyBarcodeUsage(barcode);
          if (isBarcodeUsed) {
            throw new Error(`The barcode: "${barcode}" is already in use by an existing item. Each item must have a unique barcode.`);
          }
        }
      }
    }
  }
};