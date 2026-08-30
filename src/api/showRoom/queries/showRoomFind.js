const ShowRoomViewer = require('../../../services/showRoom/showRoomViewer');

const schema = `
  showRoomFind(id: String!): ShowRoom
`;

const resolver = {
  showRoomFind: async (root, args, context) => {
    return new ShowRoomViewer(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;
