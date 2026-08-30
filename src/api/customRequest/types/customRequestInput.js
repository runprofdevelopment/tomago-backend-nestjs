const schema = `
  input CustomRequestInput {
    full_name: String
    email: String
    phone: String
    request_type: String
    description: String
    image_urls: [String]
    product_id: String
    status: String
    customer_id: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
