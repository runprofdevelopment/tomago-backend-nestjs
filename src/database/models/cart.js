const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Cart extends AbstractEntityModel {
  constructor() {
    super('cart', 'cart', {
      id: new types.String(),
      userID: new types.String(),
      items: new types.JsonArray([
        'productId',
        'variantId',
        'quantity',
      ]),
      totalQty: new types.Number(null, null, 0),
      voucherId: new types.String(),

    });
  }
};