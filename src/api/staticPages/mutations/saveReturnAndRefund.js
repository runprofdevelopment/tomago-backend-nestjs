const ReturnAndRefundService = require('../../../services/static-pages/returnAndRefundService');

const schema = `
  saveReturnAndRefund(data: StaticPageInput!): StaticPage
`;

const resolver = {
  saveReturnAndRefund: async (root, args, context) => {
    return new ReturnAndRefundService(context).save(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
