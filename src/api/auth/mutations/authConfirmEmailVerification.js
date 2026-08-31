const ErrorHandler = require('../../../errors/errorHandler');
const EmailVerificationTokenService = require('../../../services/auth/emailVerificationTokenService');

const schema = `
  authConfirmEmailVerification(token: String!): Boolean
`;

const resolver = {
  authConfirmEmailVerification: async (root, args, context) => {
    const language = context.language || 'en';
    const token = args.token;

    if (!token) {
      throw new ErrorHandler({
        errorCode: 'INVALID_TOKEN',
        message:
          language === 'ar'
            ? 'رمز التحقق مطلوب'
            : 'Verification token is required',
      });
    }

    await EmailVerificationTokenService.confirmToken(token, language);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
