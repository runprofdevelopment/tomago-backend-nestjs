const OrderEditor = require('../../../services/order/orderEditor');

const schema = `
  orderUpdate(data: OrderUpdateInput!): Order!
`;

const resolver = {
  orderUpdate: async (root, args, context) => {
    return await new OrderEditor(context).update(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;
