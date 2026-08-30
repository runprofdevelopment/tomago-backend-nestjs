const CollectionViewer = require('../../../services/collection/collectionViewer');

const schema = `
  collectionActiveList: CollectionPage!
`;

const resolver = {
  collectionActiveList: async (root, args, context) => {
    const result = await new CollectionViewer(context).listActiveItems();

    return {
      rows: result,
      count: result.length,
      pagination: { isFirstPage: true, isLastPage: true },
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
