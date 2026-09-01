const schema = `
  input SortInput {
    field: String!
    order: SortByEnum
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
