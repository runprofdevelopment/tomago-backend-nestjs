const ReturnService = require('../../../services/order-return/returnService')

const schema = `
createFullyRefundRequest(data: FullyRefundRequestInput!): ReturnRequest!
`;

const resolver = {
  createFullyRefundRequest: async (root, args, context) => {
    return await new ReturnService(context).createFullyRefundRequest(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;
