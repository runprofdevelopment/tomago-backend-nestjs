const ReturnAndRefundService = require('../../../services/static-pages/returnAndRefundService');

const schema = `
  findReturnAndRefund: StaticPage!
`;

const resolver = {
  findReturnAndRefund: async (root, args, context) => {
    return new ReturnAndRefundService(context).findOrCreateDefault();
  },
};

exports.schema = schema;
exports.resolver = resolver;
