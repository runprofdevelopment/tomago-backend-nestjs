const ReturnStatus = require('../../../services/order-return/acceptReturnRequest')

const schema = `
acceptReturnRequest(data: ReturnRequestStatusInput!): ReturnRequest!
`;

const resolver = {
  acceptReturnRequest: async (root, args, context) => {
    return await new ReturnStatus(context).acceptReturnRequest(args.data)
  },
};

exports.schema = schema;
exports.resolver = resolver;
