const CollectionViewer = require('../../../services/collection/collectionViewer');

const schema = `
  collectionFind(id: String!): Collection
`;

const resolver = {
  collectionFind: async (root, args, context) => {
    return new CollectionViewer(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
