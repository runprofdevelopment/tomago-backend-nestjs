const schema = `
  input AddressInput {
    last_name: String
    first_name: String
    name: String
    phoneNumber: String
    phoneVerified: Boolean
    address: String
    area: String
    city: String
    province: String
    country: String
    zip: String
    province_code: String
    country_code: String
    default: Boolean
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
