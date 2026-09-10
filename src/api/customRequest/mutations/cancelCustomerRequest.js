const CustomRequestService = require('../../../services/custom-request/customRequestService');

const schema = `
  cancelCustomerRequest(id: String!): CustomRequest!
`;

const resolver = {
  cancelCustomerRequest: async (root, args, context) => {
    return new CustomRequestService(context).cancel(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
