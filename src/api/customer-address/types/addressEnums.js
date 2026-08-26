const schema = `
  enum AddressFieldNameSearchEnum {
    first_name
    last_name
    address
    name
    country
    city
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
