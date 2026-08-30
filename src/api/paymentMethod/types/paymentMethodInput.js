const schema = `
  input PaymentMethodInput {
    brand: String
    last_four: String
    card_number: String
    expiry_month: Int
    expiry_year: Int
    cardholder_name: String
    is_default: Boolean
    provider_token: String
  }

  input PaymentMethodUpdateInput {
    brand: String
    last_four: String
    card_number: String
    expiry_month: Int
    expiry_year: Int
    cardholder_name: String
    is_default: Boolean
    provider_token: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
