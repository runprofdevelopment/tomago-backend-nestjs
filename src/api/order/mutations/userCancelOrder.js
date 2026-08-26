const OrderCancel = require('../../../services/order/orderCancel');

const schema = `
  userCancelOrder(id: String!, cancelReason: String!, itemsID: [String!]): Order
`;

const resolver = {
  userCancelOrder: async (root, args, context) => {
    return await new OrderCancel(context).userCancelOrder(args)
  },
};

exports.schema = schema;
exports.resolver = resolver;
