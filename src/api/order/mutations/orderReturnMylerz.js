const OrderReturn = require('../../../services/order/orderReturnMylerz');

const schema = `
orderReturnMylerz(data: OrderShippedDecoopaInput!): JSON
`;

const resolver = {
  orderReturnMylerz: async (root, args, context) => {
    const data = await new OrderReturn(
      context,
    ).orderReturnedMylerz(args.data);

    return data;
  },
};

exports.schema = schema;
exports.resolver = resolver;
