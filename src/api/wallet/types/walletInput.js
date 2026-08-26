const schema = `
  input WalletInput {
    id: String
    voucher_code: String
    recharged_balance: Float
    currency: CurrencyEnum
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;