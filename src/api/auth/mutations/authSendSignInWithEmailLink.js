const ForbiddenError = require('../../../errors/forbiddenError');
const EmailService = require('../../../services/emails/emailService');

const schema = `
  authSendSignInWithEmailLink(email: String!): Boolean
`;

const resolver = {
  authSendSignInWithEmailLink: async (root, args, context) => {
    if (!context.currentUser) {
      throw new ForbiddenError(context.language);
    }

    await EmailService.sendSignInLinkEmail(
      args.email,
      context.language || 'en',
    );

    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;