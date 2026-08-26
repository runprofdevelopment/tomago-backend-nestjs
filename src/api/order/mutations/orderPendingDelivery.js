const OrderStatus = require('../../../services/order/orderStatus');

const schema = `
  orderPendingDelivery(id: String!): Boolean
`;

const resolver = {
  orderPendingDelivery: async (root, args, context) => {
    await new OrderStatus(context).orderPendingDelivery(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
