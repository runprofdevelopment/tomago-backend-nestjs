const schema = `
  type DeviceToken {
    token: String
    lang: String
  }

  input DeviceTokenInput {
    token: String!
    lang: String!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;