const schema = `
  input AddressInput {
    last_name: String
    first_name: String
    name: String
    phoneNumber: String
    phoneVerified: Boolean
    email: String
    address: String
    area: String
    city: String
    province: String
    country: String
    zip: String
    province_code: String
    country_code: String
    address_label: String
    label: String
    default: Boolean
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
