const admin = require('firebase-admin');
const moment = require('moment');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AlgoliaProductService = require('../product/algoliaService');

const Deal = new (require('../../database/models/deal'));
const Variant = new (require('../../database/models/product-variant'));

module.exports = class VerifyVariantSale {

  static async verifyDealStarted() {
    try {
      const dateNow = moment().format('YYYY-MM-DD');

      const deals = FirebaseHelper.mapCollection(
        await admin.firestore().collection(Deal.collectionName)
          .where('status', '>=', 'active')
          .where('startDate', '<=', dateNow)
          .get()
      );

      await Promise.all(
        deals.map(deal => this._handleDeal(deal, 'started'))
      );
    } catch (error) {
      throw error;
    }
  }

  static async verifyDealEnded() {
    try {
      const dateNow = moment().format('YYYY-MM-DD');

      const deals = FirebaseHelper.mapCollection(
        await admin.firestore().collection(Deal.collectionName)
          .where('endDate', '<=', dateNow)
          .get()
      );

      await Promise.all(
        deals.map(deal => this._handleDeal(deal, 'ended'))
      );
    } catch (error) {
      throw error;
    }
  }

  static async _handleDeal(deal, status) {
    const items = deal.items || [];
    const variantIds = items.map(item => item.variantId);
    const variants = await AlgoliaProductService.fetchAlgoliaProducts(variantIds);

    if (status === 'started') {
      await Promise.all(
        variants.map(variant => this._applyStartDael(deal, variant))
      );
    } else if (status === 'ended') {
      await Promise.all(
        variants.map(variant => this._applyEndDael(variant))
      );
    }
  }

  static async _applyStartDael(deal, variant) {
    const variantId = variant.id;
    const price = variant.price;
    let currentPrice = price;

    if (deal.discountType === 'percent') {
      currentPrice = price - (price * deal.discountAmount / 100);
    } else if (deal.discountType === 'fixed') {
      currentPrice = price - deal.discountAmount;
    }

    const data = {
      sale_price: 0,
      sale_start_date: null,
      sale_end_date: null,
      onSale: true,
      current_price: currentPrice,
      ribbon_name: deal.ribbonName,
      ribbon_color: deal.ribbonColor|| '#FFFEFD',
      ribbon_background: deal.ribbonBackground || '#EC8181',
    }

    await admin.firestore().collection(Variant.collectionName).doc(variantId).update(data);
    await AlgoliaProductService.updateVariant(variantId, data);
  }

  static async _applyEndDael(variant) {
    const variantId = variant.id;
    const price = variant.price;
    let currentPrice = price;

    const data = {
      sale_price: 0,
      sale_start_date: null,
      sale_end_date: null,
      onSale: false,
      current_price: currentPrice,
    }

    await admin.firestore().collection(Variant.collectionName).doc(variantId).update(data);
    await AlgoliaProductService.updateVariant(variantId, data);
  }
};