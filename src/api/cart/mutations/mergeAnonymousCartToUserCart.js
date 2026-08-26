const CartEditor = require('../../../services/cart/cartEditor');

const schema = `
  mergeAnonymousCartToUserCart(anonymousCartId: String!): Cart
`;

const resolver = {
  mergeAnonymousCartToUserCart: async (root, args, context) => {
    return new CartEditor(context).mergeAnonymousCartToUserCart(args.anonymousCartId);
  },
};

exports.schema = schema;
exports.resolver = resolver;