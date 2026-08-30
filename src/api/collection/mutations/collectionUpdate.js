const CollectionEditor = require('../../../services/collection/collectionEditor');

const schema = `
  collectionUpdate(id: String!, data: CollectionInput!): JSON
`;

const resolver = {
  collectionUpdate: async (root, args, context) => {
    return new CollectionEditor(context).update(args.id, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
