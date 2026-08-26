const CartEditor = require('../../../services/cart/cartEditor');

const schema = `
  cartMoveToWishlist(variantId: String!): Boolean
`;

const resolver = {
  cartMoveToWishlist: async (root, args, context) => {
    await new CartEditor(context).moveToWishlist(args.variantId);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;