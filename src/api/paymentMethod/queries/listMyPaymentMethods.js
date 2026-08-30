const PaymentMethodService = require('../../../services/payment-method/paymentMethodService');

const schema = `
  listMyPaymentMethods: [PaymentMethod!]!
`;

const resolver = {
  listMyPaymentMethods: async (root, args, context) => {
    return new PaymentMethodService(context).listMyPaymentMethods();
  },
};

exports.schema = schema;
exports.resolver = resolver;
