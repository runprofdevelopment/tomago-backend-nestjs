const { error } = require('firebase-functions/logger');
const ForbiddenError = require('../../../errors/forbiddenError');

const schema = `
  authMeAdmin: User!
`;

const resolver = {
  authMeAdmin(root, args, context) {
    if (!context.currentUser || !context.currentUser.id) {
      throw new ForbiddenError(context.language);
    }


    if (context.currentUser.accountType == 'customer') {
      throw new Error('You are not an admin');
    }

    return context.currentUser;
  },
};

exports.schema = schema;
exports.resolver = resolver;