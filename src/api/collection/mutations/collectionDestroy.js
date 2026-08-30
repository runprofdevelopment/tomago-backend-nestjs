const CollectionRemover = require('../../../services/collection/collectionRemover');

const schema = `
  collectionDestroy(id: String!): Boolean
`;

const resolver = {
  collectionDestroy: async (root, args, context) => {
    await new CollectionRemover(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
