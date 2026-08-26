const schema = `
  input ReturnRequestStatusInput {
    id: String!
    rejectReason: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;