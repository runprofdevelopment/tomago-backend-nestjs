const CollectionViewer = require('../../../services/collection/collectionViewer');

const schema = `
  collectionList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): CollectionPage!
`;

const resolver = {
  collectionList: async (root, args, context) => {
    return new CollectionViewer(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;
