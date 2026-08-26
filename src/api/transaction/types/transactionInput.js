const schema = `
  input TransactionInput {
    amount: Float
    type: String
    userID: String
    payerId: String
    payeeId: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;