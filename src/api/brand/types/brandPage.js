const schema = `
  type BrandPage {
    rows: [Brand!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
