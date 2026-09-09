const schema = `
  type Account {
    id: String
    balance: Float
    currency: CurrencyEnum

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;