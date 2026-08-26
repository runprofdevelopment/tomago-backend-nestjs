const CartClearer = require('../../../services/cart/cartClearer');

const schema = `
  clearMyCart: Boolean
`;

const resolver = {
  clearMyCart: async (root, args, context) => {
    await new CartClearer(context).clearMyCart();
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;