const schema = `
  type Wallet {
    id: String
    balance: Float!
    voucher_balance: Float!
    recharged_balance: Float!
    currency: CurrencyEnum
    user: User

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
    order: Order
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;