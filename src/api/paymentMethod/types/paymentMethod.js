const schema = `
  type PaymentMethod {
    id: String
    customer_id: String
    brand: String
    last_four: String
    expiry_month: Int
    expiry_year: Int
    cardholder_name: String
    is_default: Boolean
    provider_token: String

    createdAt: DateTime
    updatedAt: DateTime
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
