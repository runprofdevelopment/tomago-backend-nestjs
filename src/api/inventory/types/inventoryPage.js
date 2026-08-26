const schema = `
  type InventoryPage {
    rows: [InventoryItem!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;