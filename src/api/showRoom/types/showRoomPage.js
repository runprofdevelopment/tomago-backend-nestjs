const schema = `
  type ShowRoomPage {
    rows: [ShowRoom!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
