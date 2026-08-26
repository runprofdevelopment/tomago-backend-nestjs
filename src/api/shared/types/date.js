const { GraphQLDate } = require('graphql-iso-date');

/** Date: A date string, such as 2007-12-03. */
const schema = `
  scalar Date
`;

const resolver = {
  Date: GraphQLDate,
};

exports.schema = schema;
exports.resolver = resolver;
