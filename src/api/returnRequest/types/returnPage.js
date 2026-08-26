const schema = `
  type ReturnPage {
    rows: [ ReturnRequest! ]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
