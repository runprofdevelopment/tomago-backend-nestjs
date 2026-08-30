const PaymentMethodService = require('../../../services/payment-method/paymentMethodService');

const schema = `
  setMyDefaultPaymentMethod(id: String!): PaymentMethod!
`;

const resolver = {
  setMyDefaultPaymentMethod: async (root, args, context) => {
    return new PaymentMethodService(context).setDefault(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
