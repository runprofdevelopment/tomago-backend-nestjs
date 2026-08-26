const CartItemRemover = require('../../../services/cart/cartItemRemover');

const schema = `
  cartRemoveItem(data: CartRemoveItemInput!): Cart
`;

const resolver = {
  cartRemoveItem: async (root, args, context) => {
    const updatedCart = await new CartItemRemover(context).execute(args.data);
    return updatedCart;
  },
};

exports.schema = schema;
exports.resolver = resolver;