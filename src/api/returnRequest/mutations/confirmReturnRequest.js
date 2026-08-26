const ReturnStatus = require('../../../services/order-return/confirmReturnRequest')

const schema = `
confirmReturnRequest(data: ReturnRequestStatusInput!): ReturnRequest!
`;

const resolver = {
  confirmReturnRequest: async (root, args, context) => {
    return await new ReturnStatus(context).confirmReturnRequest(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;