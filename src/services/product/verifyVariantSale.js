const admin = require('firebase-admin');
const moment = require('moment');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const AlgoliaService = require('./algoliaService');
const Variant = new (require('../../database/models/product-variant'));

module.exports = class VerifyVariantSale {

  static async verifySaleOnVariantsStarted() {
    try {
      const dateNow = moment().format('YYYY-MM-DD');

      const variants = FirebaseHelper.mapCollection(
        await admin.firestore().collection(Variant.collectionName)
          .where('sale_price', '>', 0)
          .where('sale_start_date', '<=', dateNow)
          .get()
      );

      await Promise.all(
        variants.map(variant => this._applySale(variant))
      );

    } catch (error) {
      throw error;
    }
  }

  static async verifySaleOnVariantsEnded() {
    try {
      const dateNow = moment().format('YYYY-MM-DD');

      const variants = FirebaseHelper.mapCollection(
        await admin.firestore().collection(Variant.collectionName)
          .where('sale_end_date', '<=', dateNow)
          .get()
      );

      await Promise.all(
        variants.map(variant => this._applySale(variant))
      );

    } catch (error) {
      throw error;
    }
  }

  static async _applySale(variant) {
    // const dateNow = new Date();
    const dateNow = moment().format('YYYY-MM-DD');
    const saleStartDate = HelperFunctions.isDate(variant.sale_start_date) ? moment(variant.sale_start_date).format('YYYY-MM-DD') : null;
    const saleEndDate = HelperFunctions.isDate(variant.sale_end_date) ? moment(variant.sale_end_date).format('YYYY-MM-DD') : null;
    const sale_price = variant.sale_price || 0;
    const price = variant.price;
    const variantId = variant.id;

    const data = {
      price,
      sale_price,
      sale_start_date: saleStartDate,
      sale_end_date: saleEndDate,
      current_price: price,
      onSale: false,
      ribbon_name: null,
      ribbon_color: '#FFFEFD',
      ribbon_background: '#EC8181',
    }

    const hasSale = (sale_price > 0 && saleStartDate && saleEndDate) ? true : false;

    if (hasSale && dateNow >= saleStartDate && dateNow <= saleEndDate) {
      data['current_price'] = sale_price;
      data['onSale'] = true;
      const discount = 100 - (sale_price / price * 100);
      data['ribbon_name'] = Math.round(discount) + '%';
    }
    
    await admin.firestore().collection(Variant.collectionName).doc(variantId).update(data);
    await AlgoliaService.updateVariant(variantId, data);
  }
};