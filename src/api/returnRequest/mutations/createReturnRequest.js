const ReturnService = require('../../../services/order-return/craeteReturnRequest');

const schema = `
createReturnRequest(data: ReturnRequestInput!): ReturnRequest!
`;

const resolver = {
  createReturnRequest: async (root, args, context) => {
    return await new ReturnService(
      context,
    ).createReturnRequest(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
