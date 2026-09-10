const CustomRequestService = require('../../../services/custom-request/customRequestService');

const schema = `
  closeCustomerRequest(id: String!): CustomRequest!
`;

const resolver = {
  closeCustomerRequest: async (root, args, context) => {
    return new CustomRequestService(context).close(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
