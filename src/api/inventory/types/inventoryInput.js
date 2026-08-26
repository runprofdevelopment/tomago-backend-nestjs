const schema = `
  input InventoryInput {
    price: Float
    quantity: Int
    max_order_qty: Int
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;