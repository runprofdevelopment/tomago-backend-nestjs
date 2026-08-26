/**
 * Maps all the Resolvers of the application.
 * - More about resolvers: https://www.apollographql.com/docs/graphql-tools/resolvers/
 */
const mergeResolvers = require('./shared/utils/mergeGraphqlResolvers');

const allTypesSchema = require('./all-types-schema');
const allQueriesSchema = require('./all-queries-schema');
const allMutationsSchema = require('./all-mutations-schema');

const types = [
  ...allTypesSchema,
].map((type) => type.resolver);

const queries = [
  ...allQueriesSchema,
].map((query) => query.resolver);

const mutations = [
  ...allMutationsSchema,
].map((mutation) => mutation.resolver);

module.exports = mergeResolvers(types, queries, mutations);