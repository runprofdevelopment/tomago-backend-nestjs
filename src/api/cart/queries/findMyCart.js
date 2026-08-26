const CartViewer = require('../../../services/cart/cartViewer');

const schema = `
  findMyCart: Cart
`;

const resolver = {
  findMyCart: async (root, args, context) => {
    return new CartViewer(context).findMyCart();
  }
};

exports.schema = schema;
exports.resolver = resolver;
