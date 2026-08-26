const schema = `
  input WalletReturnInput {
    id: String!
    balance: Float
    currency: CurrencyEnum
    orderID: String
    variantIDs: [ String ]
    status: String
    reason: String

  }



`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
