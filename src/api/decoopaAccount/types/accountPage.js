const schema = `
  type AccountPage {
    rows: [ Account! ]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;