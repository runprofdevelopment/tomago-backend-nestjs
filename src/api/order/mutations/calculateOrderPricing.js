const { calculateOrderPricing } = require('../../../services/order/priceCalculator');

const schema = `
  calculateOrderPricing(paymentMethod: PaymentMethodEnum): Pricing
`;

const resolver = {
  calculateOrderPricing: async (root, args, context) => {
    return await calculateOrderPricing({
      cartId: context.currentUser.id,
      paymentMethod: args.paymentMethod,
    });
  },
};

exports.schema = schema;
exports.resolver = resolver;
