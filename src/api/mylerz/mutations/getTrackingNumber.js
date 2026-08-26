const getTrackingNumber = require('../../../utils/mylerz/getTrackingNumber');

const schema = `
getTrackingNumber(orderId: String!): JSON
`;

const resolver = {
  getTrackingNumber: async (root, args, context) => {
    const data = await getTrackingNumber(args.orderId);
    return data;
  },
};

exports.schema = schema;
exports.resolver = resolver;
