const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Voucher extends AbstractEntityModel {
  constructor() {
    super('voucher', 'voucher', {
      id: new types.String(),
      userID: new types.String(),
      voucher_code: new types.String(),
      voucher_type: new types.Enumerator(['BALANCE', 'SALE']),
      voucher_amount: new types.String(),
      user_count: new types.Number(),
      use_per_user: new types.Number(),
      usage: new types.Json(),
      search: new types.Number(), // extra field to be able to filter/search by amount since amount is encrypted
      startDate: new types.Date(),
      endDate: new types.Date(),
      voucher_amount_type: new types.Enumerator(['percent', 'fixed']),
      total_uses: new types.Number()
    });
  }
};

