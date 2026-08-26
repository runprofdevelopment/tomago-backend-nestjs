const CartVoucher = require('../../../services/cart/cartVoucher');

const schema = `
cartRemoveVoucher: Boolean!
`;

const resolver = {
  cartRemoveVoucher: async (root, args, context) => {
    const response = await new CartVoucher(context).setVoucherIdNull()
    return response
  },
};

exports.schema = schema;
exports.resolver = resolver;
