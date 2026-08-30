const PaymentMethodService = require('../../../services/payment-method/paymentMethodService');

const schema = `
  paymentMethodCreate(data: PaymentMethodInput!): PaymentMethod!
`;

const resolver = {
  paymentMethodCreate: async (root, args, context) => {
    return new PaymentMethodService(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
