const CollectionViewer = require('../../../services/collection/collectionViewer');

const schema = `
  collectionFeaturedList: CollectionPage!
`;

const resolver = {
  collectionFeaturedList: async (root, args, context) => {
    const result = await new CollectionViewer(context).listFeaturedItems();

    return {
      rows: result,
      count: result.length,
      pagination: { isFirstPage: true, isLastPage: true },
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
