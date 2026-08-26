const schema = `
  type NotificationPage {
    rows: [Notification!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
