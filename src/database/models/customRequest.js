const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class CustomRequest extends AbstractEntityModel {
  constructor() {
    super('customRequest', 'customRequest', {
      full_name: new types.String(),
      email: new types.String(),
      phone: new types.String(),
      request_type: new types.String(),
      description: new types.String(),
      image_urls: new types.StringArray(),
      product_id: new types.String(),
      status: new types.Enumerator(['pending', 'replied', 'closed'], 'pending'),
      customer_id: new types.String(),
      estimated_price: new types.Number(),
      estimated_delivery_time: new types.String(),
      messages: new types.JsonArray([
        'id',
        'sender_type',
        'sender_name',
        'body',
        'created_at',
      ]),
    });
  }
};
