const OrderCreator = require('../../../services/order/orderCreator')

const schema = `
  orderCreate(data: OrderInput!): PlaceOrder!
`;

const resolver = {
  orderCreate: async (root, args, context) => {
    args.data['ipAddress'] = context.ipAddress
    return new OrderCreator(context).execute(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;