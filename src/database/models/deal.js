const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Deal extends AbstractEntityModel {
  constructor() {
    super('deal', 'deal', {
      name: new types.String(),
      startDate: new types.Date(),
      endDate: new types.Date(),
      discountType: new types.Enumerator(['percent', 'fixed']),
      discountAmount: new types.Number(),
      currency: new types.Enumerator(['USD', 'EGP', 'SAR', 'AED'], 'EGP'),
      ribbonName: new types.String(),
      ribbonColor: new types.String(),
      ribbonBackground: new types.String(),

      status: new types.Enumerator(['active', 'inactive'], 'active'),
      items: new types.JsonArray([
        'productId',
        'variantId',
      ]),
    });
  }
}