const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Settings extends (
  AbstractEntityModel
) {
  constructor() {
    super('settings', 'settings', {
      vat: new types.Number(),
      cash_on_delivery_fees: new types.Number(),
    });
  }
};
