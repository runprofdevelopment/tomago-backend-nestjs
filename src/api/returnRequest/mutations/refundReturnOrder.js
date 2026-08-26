const ReturnService = require('../../../services/order-return/refundReturnOrder');

const schema = `
refundReturnOrder(data: WalletReturnInput!): Wallet!
`;

const resolver = {
  refundReturnOrder: async (root, args, context) => {
    return await new ReturnService(
      context,
    ).refund(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;
