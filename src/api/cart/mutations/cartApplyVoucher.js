const CartVoucher = require('../../../services/cart/cartVoucher');

const schema = `
applyVoucherToCart(id: String!): Cart!
`;

const resolver = {
  applyVoucherToCart: async (root, args, context) => {
    const response = await new CartVoucher(
      context,
    ).applyVoucherToCart(args.id);
    return response;
  },
};

exports.schema = schema;
exports.resolver = resolver;
