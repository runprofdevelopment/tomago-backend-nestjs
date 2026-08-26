const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class WithdrawalRequest extends AbstractEntityModel {
  constructor() {
    super('withdrawalRequest', 'withdrawalRequest', {
      account_name: new types.String(),
      account_number: new types.String(),
      bank_name: new types.String(),
      swift_code: new types.String(),
      status: new types.Enumerator(['pending', 'accepted', 'rejected', 'confirmed'], 'pending'),
      withdrawal_amount: new types.Number(),
      reason: new types.String(),
      userID: new types.String(),
      referenceId: new types.String(),
      note: new types.String(),
      transactionId: new types.String(),
    });
  }
};