const PaymentMethodService = require('../../../services/payment-method/paymentMethodService');

const schema = `
  paymentMethodDestroy(id: String!): Boolean
`;

const resolver = {
  paymentMethodDestroy: async (root, args, context) => {
    return new PaymentMethodService(context).destroy(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
