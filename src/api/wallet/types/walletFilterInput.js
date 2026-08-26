const schema = `
  input WalletFilterInput {
    field: WalletFieldEnum!
    operator: QueryOperatorEnum!
    value: String
    values: [ String ]
  }

  enum WalletFieldEnum {
    id
    balance
    currency
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;