const CartItemQuantityManager = require('../../../services/cart/cartItemQuantityManager');

const schema = `
  cartEditQuantity(item: CartItemInput!): Cart!
`;

const resolver = {
  cartEditQuantity: async (root, args, context) => {
    return new CartItemQuantityManager(context).updateQuantity(args.item);
  },
};

exports.schema = schema;
exports.resolver = resolver;