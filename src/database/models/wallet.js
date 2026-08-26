const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Wallet extends AbstractEntityModel {
  constructor() {
    super('wallet', 'wallet', {
      balance: new types.String(), // strings necause they're encrypted
      voucher_balance: new types.String(),
      recharged_balance: new types.String(),
      currency: new types.Enumerator(['EGP', 'AED', 'SAR']),
      search: new types.Number()
    });
  }
};