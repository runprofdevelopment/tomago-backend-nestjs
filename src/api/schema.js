/**
 * Maps all the Schema of the application.
 * - More about the schema: https://www.apollographql.com/docs/graphql-tools/generate-schema/
 */
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const resolvers = require('./resolvers');

const allTypesSchema = require('./all-types-schema');
const allQueriesSchema = require('./all-queries-schema');
const allMutationsSchema = require('./all-mutations-schema');

const types = [
  ...allTypesSchema,
].map((type) => type.schema);

const queries = [
  ...allQueriesSchema,
].map((query) => query.schema);

const mutations = [
  ...allMutationsSchema,
].map((mutation) => mutation.schema);

const query = `
  type Query {
    ${queries.join('\n')}
  }
`;

const mutation = `
  type Mutation {
    ${mutations.join('\n')}
  }
`;

const schemaDefinition = `
  type Schema {
    query: Query
    mutation: Mutation
  }
`;


// const fs = require('fs');
// const sdlString = `${schemaDefinition} ${query} ${mutation} ${types.join('\n')}`;
// let data = JSON.stringify(sdlString.replace(/(\r\n|\n|\r)/gm, ""));
// fs.writeFileSync('/Users/apple/Desktop/SDLSchema.json', data);

// #region [ Generate All Types Schema Only ]
  // const fs = require('fs');
  // const sdlString = `${types}`;
  // const FILE_DATA = `const all_types_schema = \`${sdlString.replace(/,/g, '')}\``;
  // const saveFilePath = '/Users/mac/Desktop/all_types_schema.js';
  // // const saveFilePath = '/Users/apple/Desktop/all_types_schema.js';
  // fs.writeFileSync(saveFilePath, FILE_DATA);
// #endregion

//#region [ Convert GraphQl SDL Schema To JOSN ]
  // const { buildSchema, graphqlSync, introspectionQuery } = require("graphql");
  // const sdlString = `${schemaDefinition} ${query} ${mutation} ${types.join('\n')}`;
  // const sdlString = ``
  // const graphqlSchemaObj = buildSchema(sdlString);
  // const result = graphqlSync(graphqlSchemaObj, introspectionQuery).data;
  // const fs = require('fs');
  // let data = JSON.stringify(result);
  // fs.writeFileSync('/Users/apple/Desktop/introspectionSchema.json', data);
//#endregion

exports.types = types.join('');
exports.query = query;
exports.mutation = mutation;
exports.schemaDefinition = schemaDefinition;
exports.GraphQLSchemaString = `${schemaDefinition} ${query} ${mutation} ${types.join('\n')}`;

exports.schema = makeExecutableSchema({
  typeDefs: [schemaDefinition, query, mutation, ...types],
  resolvers,
});

// module.exports = makeExecutableSchema({
//   typeDefs: [schemaDefinition, query, mutation, ...types],
//   resolvers,
// });