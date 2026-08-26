const CartViewer = require('../../../services/cart/cartViewer');

const schema = `
  fetchCartItemCount: Int!
`;

const resolver = {
  fetchCartItemCount: async (root, args, context) => {
    return new CartViewer(context).fetchCartItemCount();
  }
};

exports.schema = schema;
exports.resolver = resolver;
