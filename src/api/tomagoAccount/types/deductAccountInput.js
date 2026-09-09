const schema = `
  input DeductTomagoAccountInput {
    amount: Float!
    note: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;