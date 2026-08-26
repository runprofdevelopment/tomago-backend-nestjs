const Kashier = require('../../../infrastructure/payments/kashier')

const schema = `
  generateKashierOrderHash(
    amount: String!, 
    currency: String!, 
    merchantOrderId: String!, 
    customerId: String
    secretKey: String!
    merchantId: String!
  ): String
`;

const resolver = {
  generateKashierOrderHash: async (root, args, context) => {
    const hash = Kashier.generateCustomOrderHash(args);
    return hash;
  },
};

exports.schema = schema;
exports.resolver = resolver;