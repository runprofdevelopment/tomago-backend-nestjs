const CollectionCreator = require('../../../services/collection/collectionCreator');

const schema = `
  collectionCreate(data: CollectionInput!): JSON
`;

const resolver = {
  collectionCreate: async (root, args, context) => {
    return new CollectionCreator(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
