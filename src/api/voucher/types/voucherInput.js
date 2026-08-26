const schema = `
  input VoucherInput {
    userID: String
    voucher_code: String!
    voucher_type: VoucherEnum!
    voucher_amount: Float!
    user_count: Int!
    use_per_user: Int!
    startDate: Date!
    endDate: Date!
    voucher_amount_type: VoucherAmountEnumType!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
