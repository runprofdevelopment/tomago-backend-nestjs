const schema = `
  type CustomRequest {
    id: String
    full_name: String
    email: String
    phone: String
    request_type: String
    description: String
    image_urls: [String]
    product_id: String
    status: String
    customer_id: String

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }

  type CustomRequestPage {
    rows: [CustomRequest!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
