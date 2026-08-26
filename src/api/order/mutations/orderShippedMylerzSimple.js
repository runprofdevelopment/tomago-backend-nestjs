const OrderShipmentMylerzSimple = require('../../../services/order/orderShipmentMylerzSimple');

const schema = `
orderShippedMylerzSimple(data: OrderShippedDecoopaInput!): JSON
`;

const resolver = {
  orderShippedMylerzSimple: async (root, args, context) => {
    const data = await new OrderShipmentMylerzSimple(
      context,
    ).orderShippedMylerz(args.data);
    return data;
  },
};

exports.schema = schema;
exports.resolver = resolver;
