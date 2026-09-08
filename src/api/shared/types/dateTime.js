const { GraphQLDateTime } = require('graphql-iso-date');
const { GraphQLScalarType, Kind } = require('graphql');

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Birth dates and similar fields are stored as YYYY-MM-DD, not full ISO datetimes. */
function coerceDateTime(value) {
  if (typeof value === 'string' && DATE_ONLY.test(value.trim())) {
    return `${value.trim()}T00:00:00.000Z`;
  }

  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  return value;
}

/** DateTime: A date-time string at UTC, such as 2007-12-03T10:15:30Z. */
const schema = `
  scalar DateTime
`;

const resolver = {
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: GraphQLDateTime.description,
    serialize(value) {
      return GraphQLDateTime.serialize(coerceDateTime(value));
    },
    parseValue(value) {
      return GraphQLDateTime.parseValue(coerceDateTime(value));
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return GraphQLDateTime.parseLiteral({
          ...ast,
          value: coerceDateTime(ast.value),
        });
      }

      return GraphQLDateTime.parseLiteral(ast);
    },
  }),
};

exports.schema = schema;
exports.resolver = resolver;
