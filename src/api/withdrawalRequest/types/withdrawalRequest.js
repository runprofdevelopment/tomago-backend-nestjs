const schema = `
  type WithdrawalRequest {
    id: String
    account_name: String
    account_number: String
    bank_name: String
    swift_code: String
    withdrawal_amount: Float
    userID: String
    status: WithdrawalRequestEnum
    referenceId: String
    reason: String
    user: User
    note: String
    
    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }

  enum WithdrawalRequestEnum {
    pending
    accepted
    rejected
    confirmed
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;