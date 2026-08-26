const schema = `
  input CartInput {
    item: CartItemInput!
  }

  input CartItemInput {
    variantId: String!
    quantity: Int!
  }

  input CartRemoveItemInput {
    userId: String
    variantId: String!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;