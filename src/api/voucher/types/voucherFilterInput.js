const schema = `
  input VoucherFilterInput {
    field: VoucherFieldEnum!
    operator: QueryOperatorEnum!
    value: String
    values: [ String ]
  }

  enum VoucherFieldEnum {
    userID
    voucher_amount
    voucher_code
    voucher_type
    user_count
    use_per_user
    usage
    startDate
    endDate
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
