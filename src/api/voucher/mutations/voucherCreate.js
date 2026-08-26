const VoucherCreator = require('../../../services/voucher/voucherCreator')

const schema = `
  voucherCreate(data: VoucherInput!): Voucher!
`;

const resolver = {
  voucherCreate: async (root, args, context) => {
    return new VoucherCreator(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
