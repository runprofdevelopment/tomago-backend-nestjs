const OrderShipment = require('../../../services/order/orderShipment');

const schema = `
orderShippedDecoopa(data: OrderShippedDecoopaInput!): Boolean
`;

const resolver = {
  orderShippedDecoopa: async (root, args, context) => {
    await new OrderShipment(context).orderShippedDecoopa(args.data);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
