const ShowRoomViewer = require('../../../services/showRoom/showRoomViewer');

const schema = `
  showRoomList(filter: [ FilterInput! ], sort: [SortInput!], pagination: PaginationInput): ShowRoomPage!
`;

const resolver = {
  showRoomList: async (root, args, context) => {
    return new ShowRoomViewer(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;
