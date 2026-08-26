const VoucherEditor = require('../../../services/voucher/voucherEditor');

const schema = `
  voucherDelete(id: String!): Boolean
`;

const resolver = {
  voucherDelete: async (root, args, context) => {
    return new VoucherEditor(context).deleteVoucher(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
