const schema = `
  input WalletTopUpInput {
    id: String!
    balance: Float!
    currency: CurrencyEnum
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;