const CartViewer = require('../../../services/cart/cartViewer');

const schema = `
  fetchCheckoutDetails(cashOnDelivery: Boolean): CheckoutDetails
`;

const resolver = {
  fetchCheckoutDetails: async (root, args, context) => {
    return new CartViewer(context).viewCartCheckout(args.cashOnDelivery);
  }
};

exports.schema = schema;
exports.resolver = resolver;