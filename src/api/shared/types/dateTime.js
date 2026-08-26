const { GraphQLDateTime } = require('graphql-iso-date');

/** DateTime: A date-time string at UTC, such as 2007-12-03T10:15:30Z. */
const schema = `
  scalar DateTime
`;

const resolver = {
  DateTime: GraphQLDateTime,
};

exports.schema = schema;
exports.resolver = resolver;
