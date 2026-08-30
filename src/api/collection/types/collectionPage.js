const schema = `
  type CollectionPage {
    rows: [Collection!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
