const OrderStatus = require('../../../services/order/orderStatus');

const schema = `
  orderReceivedVisa(id: String!): Boolean
`;

const resolver = {
  orderReceivedVisa: async (root, args, context) => {
    await new OrderStatus(context).orderReceivedVisa(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;