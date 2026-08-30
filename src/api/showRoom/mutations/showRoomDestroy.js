const ShowRoomRemover = require('../../../services/showRoom/showRoomRemover');

const schema = `
  showRoomDestroy(id: String!): Boolean
`;

const resolver = {
  showRoomDestroy: async (root, args, context) => {
    await new ShowRoomRemover(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
