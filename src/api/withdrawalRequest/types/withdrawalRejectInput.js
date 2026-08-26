const schema = `
  input WithdrawalRejectInput {
    id: String!
    reason: String!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
