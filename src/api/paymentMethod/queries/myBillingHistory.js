const PaymentMethodService = require('../../../services/payment-method/paymentMethodService');

const schema = `
  myBillingHistory(
    filter: [ FilterInput! ],
    orderBy: String,
    pagination: PaginationInput
  ): OrderPage!
`;

const resolver = {
  myBillingHistory: async (root, args, context) => {
    return new PaymentMethodService(context).myBillingHistory(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;
