const ShowRoomEditor = require('../../../services/showRoom/showRoomEditor');

const schema = `
  showRoomUpdate(id: String!, data: ShowRoomInput!): JSON
`;

const resolver = {
  showRoomUpdate: async (root, args, context) => {
    return new ShowRoomEditor(context).update(args.id, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
