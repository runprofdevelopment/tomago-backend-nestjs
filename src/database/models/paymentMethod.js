const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class PaymentMethod extends AbstractEntityModel {
  constructor() {
    super('paymentMethod', 'paymentMethod', {
      customer_id: new types.String(),
      brand: new types.Enumerator(['visa', 'mastercard', 'amex', 'paypal']),
      last_four: new types.String(),
      expiry_month: new types.Number(),
      expiry_year: new types.Number(),
      cardholder_name: new types.String(),
      is_default: new types.Boolean(false),
      provider_token: new types.String(),
    });
  }
};
