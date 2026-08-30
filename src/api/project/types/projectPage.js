const schema = `
  type ProjectPage {
    rows: [Project!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
