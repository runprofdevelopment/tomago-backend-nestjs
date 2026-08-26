const schema = `
  type VoucherPage {
    rows: [ Voucher! ]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
