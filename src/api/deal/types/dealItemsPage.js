const schema = `
  type DealItemsPage {
    rows: [AlgoliaProduct!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;