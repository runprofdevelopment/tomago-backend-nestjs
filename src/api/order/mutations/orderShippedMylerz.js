const OrderShipmentMylerz = require('../../../services/order/orderShipmentMylerz');

const schema = `
orderShippedMylerz(data: OrderShippedDecoopaInput!): JSON
`;

const resolver = {
  orderShippedMylerz: async (root, args, context) => {
    const data = await new OrderShipmentMylerz(
      context,
    ).orderShippedMylerz(args.data);

    return data;
  },
};

exports.schema = schema;
exports.resolver = resolver;
