const CartItemAdder = require('../../../services/cart/cartItemAdder');

const schema = `
  cartAddItem(item: CartItemInput!): Boolean
`;

const resolver = {
  cartAddItem: async (root, args, context) => {
    await new CartItemAdder(context).execute(args.item);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;