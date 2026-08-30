const schema = `
  type Address {
    id: String
    customer_id: String
    first_name: String
    last_name: String
    name: String
    phoneNumber: String
    phoneVerified: Boolean
    email: String
    company: String
    address: String
    area: String
    city: String
    province: String
    country: String
    zip: String
    province_code: String
    country_code: String
    #country_name: String
    address_label: String
    label: String
    default: Boolean

    createdAt: DateTime
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
