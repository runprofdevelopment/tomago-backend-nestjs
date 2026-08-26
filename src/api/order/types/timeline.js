const schema = `
  type Timeline {
    id: String
    order_id: String
    event_type: String
    event_description: String
  
    creator: User

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;