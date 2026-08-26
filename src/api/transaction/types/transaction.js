const schema = `
  type Transaction {
    id: String
    amount: Float
    type: TransactionType
    userID: String
    payerId: String
    payeeId: String
    operation_details: OperationDetails
    voucher_code: String
    note: String
    description: String

    payer: User
    payee: User

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }

  type OperationDetails {
    operation: String
    id: String
  }

  enum TransactionType {
    walletPayment
    visaPayment
    codPayment
    confirmedWithdrawal
    walletRecharge
    walletRefund
    returnItems
    accountCredit
    accountDebit
    accountTransfer
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;