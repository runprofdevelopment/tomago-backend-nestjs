const schema = `
  input DeductWalletInput {
    id: String!
    deduction_amount: Float!
    currency: CurrencyEnum
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;