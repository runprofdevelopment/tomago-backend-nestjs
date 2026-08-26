const OrderCancel = require('../../../services/order/orderCancel');

const schema = `
adminCancelOrder(id: String!, cancelReason: String!, itemsID: [String!]): Order
`;

const resolver = {
  adminCancelOrder: async (root, args, context) => {
    return await new OrderCancel(context).adminCancelOrder(args)
  },
};

exports.schema = schema;
exports.resolver = resolver;
