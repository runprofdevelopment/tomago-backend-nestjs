const VoucherViewer = require('../../../services/voucher/voucherViewer');

const schema = `
  viewVoucher(id: String!): Voucher
`;

const resolver = {
  viewVoucher: async (root, args, context) => {
    return new VoucherViewer(context).view(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
