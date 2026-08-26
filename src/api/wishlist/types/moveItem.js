const schema = `
  input MoveItemInput {
    variantId: String!
    quantity: Int!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;