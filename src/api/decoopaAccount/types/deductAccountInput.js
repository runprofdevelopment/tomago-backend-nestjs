const schema = `
  input DeductDecoopaAccountInput {
    amount: Float!
    note: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;