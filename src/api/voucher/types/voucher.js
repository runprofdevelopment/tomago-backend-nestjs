const schema = `
  type Voucher {
    id: String
    userID: String
    voucher_code: String!
    voucher_type: VoucherEnum!
    voucher_amount: Float
    user_count: Int!
    use_per_user: Int!
    usage: JSON
    startDate: Date
    endDate: Date
    voucher_amount_type: VoucherAmountEnumType!
    total_uses: Int

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
