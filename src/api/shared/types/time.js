const { GraphQLTime } = require('graphql-iso-date');

/**
 * A time string at UTC, such as 10:15:30Z
 */
const schema = `
  scalar Time
`;

const resolver = {
  Time: GraphQLTime,
};

exports.schema = schema;
exports.resolver = resolver;
