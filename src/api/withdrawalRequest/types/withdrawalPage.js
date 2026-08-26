const schema = `
  type WithdrawalPage {
    rows: [ WithdrawalRequest! ]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
