const schema = `
  type UserPage {
    rows: [ User! ]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
