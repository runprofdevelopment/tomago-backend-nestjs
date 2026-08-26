const ReturnReceived = require('../../../services/order/ReturnReceived');

const schema = `
returnReceivedRequest(data: ReturnReceivedInput!): Boolean
`;

const resolver = {
  returnReceivedRequest: async (root, args, context) => {
    await new ReturnReceived(context).returnReceivedStauts(
      args.data,
    );
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
