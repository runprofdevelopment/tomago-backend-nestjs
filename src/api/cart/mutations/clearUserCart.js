const CartClearer = require('../../../services/cart/cartClearer');

const schema = `
  clearUserCart(userId: String!): Boolean
`;

const resolver = {
  clearUserCart: async (root, args, context) => {
    await CartClearer.clearUserCart(args.userId);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;