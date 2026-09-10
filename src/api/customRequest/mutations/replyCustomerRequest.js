const CustomRequestService = require('../../../services/custom-request/customRequestService');

const schema = `
  replyCustomerRequest(id: String!, input: CustomerRequestReplyInput!): CustomRequest!
`;

const resolver = {
  replyCustomerRequest: async (root, args, context) => {
    return new CustomRequestService(context).reply(args.id, args.input);
  },
};

exports.schema = schema;
exports.resolver = resolver;
