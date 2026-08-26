const getTrackingLink = require('../../../utils/mylerz/getTrackingLink');

const schema = `
getTrackingLink(trackingNumber: String!): JSON
`;

const resolver = {
  getTrackingLink: async (root, args, context) => {
    const data = await getTrackingLink(args.trackingNumber);
    return data;
  },
};

exports.schema = schema;
exports.resolver = resolver;
