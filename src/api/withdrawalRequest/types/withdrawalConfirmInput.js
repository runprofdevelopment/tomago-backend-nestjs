const schema = `
  input WithdrawalConfirmInput {
    id: String!
    referenceId: String!
    note: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
