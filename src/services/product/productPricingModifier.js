const moment = require('moment');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Variant = new (require('../../database/models/product-variant'));

module.exports = class ProductPricingModifier {
  static async adjustPricing(variantId, record) {
    const variant = await FirebaseHelper.findDocument(Variant.collectionName, variantId);

    // const dateNow = new Date();
    const dateNow = moment().format('YYYY-MM-DD');
    const sale_start_date = record?.sale_start_date || variant?.sale_start_date || null;
    const sale_end_date = record?.sale_end_date || variant?.sale_end_date || null;
    const saleStartDate = HelperFunctions.isDate(sale_start_date) ? moment(sale_start_date).format('YYYY-MM-DD') : null;
    const saleEndDate = HelperFunctions.isDate(sale_end_date) ? moment(sale_end_date).format('YYYY-MM-DD') : null;
    const sale_price = record?.sale_price || variant?.sale_price || 0;
    const price = record.price || variant.price;

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

    const hasSale = sale_price > 0 && saleStartDate && saleEndDate ? true : false;

    if (hasSale && dateNow >= saleStartDate && dateNow <= saleEndDate) {
      data['current_price'] = sale_price;
      data['onSale'] = true;
      const discount = 100 - (sale_price / price * 100);
      data['ribbon_name'] = Math.round(discount) + '%';
    }

    return data;
  }
};