const EmailService = require('../../../services/emails/emailService');

const schema = `
  authSendPasswordResetEmail(email: String!): Boolean
`;

const resolver = {
  authSendPasswordResetEmail: async (root, args, context) => {
    await EmailService.sendResetPasswordEmail(
      args.email,
      context.language,
      // accountType,
    );

    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
