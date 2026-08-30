const PaymentMethodService = require('../../../services/payment-method/paymentMethodService');

const schema = `
  paymentMethodUpdate(id: String!, data: PaymentMethodUpdateInput!): PaymentMethod!
`;

const resolver = {
  paymentMethodUpdate: async (root, args, context) => {
    return new PaymentMethodService(context).update(args.id, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
