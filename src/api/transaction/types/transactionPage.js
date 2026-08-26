const schema = `
  type TransactionPage {
    rows: [ Transaction! ]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
