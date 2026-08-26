const OrderReturn = require('../../../services/order/orderReturnDecopa');

const schema = `
orderReturnDecoopa(data: OrderShippedDecoopaInput!): Boolean
`;

const resolver = {
  orderReturnDecoopa: async (root, args, context) => {
    await new OrderReturn(context).orderReturnedDecoopa(
      args.data,
    );
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
