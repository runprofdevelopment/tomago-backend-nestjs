const ShowRoomViewer = require('../../../services/showRoom/showRoomViewer');

const schema = `
  showRoomActiveList: ShowRoomPage!
`;

const resolver = {
  showRoomActiveList: async (root, args, context) => {
    const result = await new ShowRoomViewer(context).listActiveItems();

    return {
      rows: result,
      count: result.length,
      pagination: { isFirstPage: true, isLastPage: true },
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
