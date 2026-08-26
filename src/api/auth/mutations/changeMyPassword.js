const ForbiddenError = require('../../../errors/forbiddenError');
const AuthProfileEditor = require('../../../services/auth/authProfileEditor');

const schema = `
  changeMyPassword(oldPassword: String!, newPassword: String!): Boolean
`;

const resolver = {
  changeMyPassword: async (root, args, context) => {
    if (!context.currentUser || !context.currentUser.id) {
      throw new ForbiddenError(context.language);
    }

    await new AuthProfileEditor(context).changeMyPassword(args.oldPassword, args.newPassword);
    return true
  },
};

exports.schema = schema;
exports.resolver = resolver;
