const CustomRequestService = require('../../../services/custom-request/customRequestService');

const schema = `
  customRequestCreate(data: CustomRequestInput!): CustomRequest!
`;

const resolver = {
  customRequestCreate: async (root, args, context) => {
    return new CustomRequestService(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
