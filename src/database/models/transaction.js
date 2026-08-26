const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');
const { descriptionOf } = require('../../security/roles');
const TRANSACTION_TYPE = [
  'walletPayment', 'visaPayment', 'codPayment',
  'voucherRecharge', 'visaRecharge', 'confirmedWithdrawal',
  'walletRefund', 'returnItems', 
  'accountCredit', 'accountDebit', 'accountTransfer',
]

module.exports = class Transaction extends AbstractEntityModel {
  constructor() {
    super('transaction', 'transaction', {
      id: new types.String(),
      userID: new types.String(),
      orderId: new types.String(),
      amount: new types.Number(),
      type: new types.Enumerator(TRANSACTION_TYPE),
      payerId: new types.String(),
      payeeId: new types.String(),
      payer_name: new types.String(),
      payee_name: new types.String(),
      operation_details: new types.Json(['operation', 'id']),
      
      description: new types.String(),
      note: new types.String(),
    })
  }
}
