const EmailSender = require('../../../infrastructure/email/emailSender');

const schema = `
  authIsEmailConfigured: Boolean
`;

const resolver = {
  authIsEmailConfigured: async (root, args, context) => {
    return EmailSender.isConfigured;
  },
};

exports.schema = schema;
exports.resolver = resolver;
