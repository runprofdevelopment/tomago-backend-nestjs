const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class ReturnRequest extends AbstractEntityModel {
  constructor() {
    super('returnRequest', 'returnRequest', {
      type: new types.Enumerator(['partialrefund, fullrefund']),
      status: new types.Enumerator(['pending', 'accepted', 'rejected', 'returned'], 'pending'),
      items: new types.JsonArray([
        'productId',
        'variantId',
        'quantity',
        'price'
      ]),
      returnReason: new types.String(),
      rejectReason: new types.String(),
      comments: new types.String(),
      photos: new types.StringArray(),
      orderID: new types.String(),
      userID: new types.String()
    });
  }
};