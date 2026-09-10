const schema = `
  type RequestMessage {
    id: String
    sender_type: String
    sender_name: String
    body: String
    created_at: DateTime
  }

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
    estimated_price: Float
    estimated_delivery_time: String
    messages: [RequestMessage!]

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
