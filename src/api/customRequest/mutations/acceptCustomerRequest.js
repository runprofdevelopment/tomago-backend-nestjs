const CustomRequestService = require('../../../services/custom-request/customRequestService');

const schema = `
  acceptCustomerRequest(id: String!): CustomRequest!
`;

const resolver = {
  acceptCustomerRequest: async (root, args, context) => {
    return new CustomRequestService(context).accept(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
