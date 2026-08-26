const ReturnStatus = require('../../../services/order-return/rejectReturnRequest')

const schema = `
rejectReturnRequest(data: ReturnRequestStatusInput!): ReturnRequest!
`;

const resolver = {
  rejectReturnRequest: async (root, args, context) => {
    return await new ReturnStatus(context).rejectReturnRequest(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;
