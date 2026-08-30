const ShowRoomCreator = require('../../../services/showRoom/showRoomCreator');

const schema = `
  showRoomCreate(data: ShowRoomInput!): JSON
`;

const resolver = {
  showRoomCreate: async (root, args, context) => {
    return new ShowRoomCreator(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
