const schema = `
  input WithdrawalRequestInput {
    account_name: String!
    account_number: String!
    bank_name: String!
    swift_code: String!
    withdrawal_amount: Float!
    status: WithdrawalRequestEnum
    reason: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;