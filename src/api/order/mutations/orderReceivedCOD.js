const OrderStatus = require('../../../services/order/orderStatus');

const schema = `
orderReceivedCOD(id: String!): Boolean
`;

const resolver = {
  orderReceivedCOD: async (root, args, context) => {
    await new OrderStatus(context).orderReceivedCOD(args.id);
    return  true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
