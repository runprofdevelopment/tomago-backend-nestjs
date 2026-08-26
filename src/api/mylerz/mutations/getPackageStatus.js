const getPackageStatus = require('../../../utils/mylerz/getPackageStatus');

const schema = `
getPackageStatus(trackingNumber: String!): JSON
`;

const resolver = {
  getPackageStatus: async (root, args, context) => {
    const data = await getPackageStatus(
      args.trackingNumber,
    );
    return data;
  },
};

exports.schema = schema;
exports.resolver = resolver;
