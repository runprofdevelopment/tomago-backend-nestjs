const ReturnService = require('../../../services/order-return/viewMyReturnRequests')

const schema = `
viewMyReturnRequests: [ReturnRequest] !
`;

const resolver = {
  viewMyReturnRequests: async (root, args, context) => {
    return await new ReturnService(context).viewMyReturnRequests()
  },
};

exports.schema = schema;
exports.resolver = resolver;
