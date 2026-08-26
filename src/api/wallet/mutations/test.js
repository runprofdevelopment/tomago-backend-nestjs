
const OrderCancel = require('../../../services/order/orderCancel');

const schema = `
testCancel(id: String!): Boolean
`;

const resolver = {
  testCancel: async (root, args, context) => {

            await new OrderCancel(
              context,
            ).cancelOrderPendingPayment(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
