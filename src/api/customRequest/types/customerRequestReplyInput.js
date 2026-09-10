const schema = `
  input CustomerRequestReplyInput {
    body: String!
    estimatedPrice: Float!
    estimatedDeliveryTime: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
