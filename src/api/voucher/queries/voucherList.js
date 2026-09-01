const VoucherViewer = require('../../../services/voucher/voucherViewer');

const schema = `
voucherList(filter: [ VoucherFilterInput! ], sort: [SortInput!], pagination: PaginationInput): VoucherPage!
`;

const resolver = {
  voucherList: async (root, args, context) => {
    return await new VoucherViewer(context).listVouchers(args);
  }
};

exports.schema = schema;
exports.resolver = resolver;
