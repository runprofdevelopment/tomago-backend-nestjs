const schema = `
  input AdInput {
    title: String!
    body_html: String!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;