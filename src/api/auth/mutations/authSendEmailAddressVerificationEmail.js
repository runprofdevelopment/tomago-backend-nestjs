const ForbiddenError = require('../../../errors/forbiddenError');
const EmailService = require('../../../services/emails/emailService');
const UserRepository = require('../../../database/repositories/userRepository');

const schema = `
  authSendEmailAddressVerificationEmail: Boolean
`;

const resolver = {
  authSendEmailAddressVerificationEmail: async (root, args, context) => {
    console.log('authSendEmailAddressVerificationEmail: Starting email verification');
    console.log('authSendEmailAddressVerificationEmail: context.currentUser:', context.currentUser);
    
    if (!context.currentUser) {
      console.log('authSendEmailAddressVerificationEmail: No currentUser in context, throwing ForbiddenError');
      throw new ForbiddenError(context.language);
    }

    console.log('authSendEmailAddressVerificationEmail: User authenticated, email:', context.currentUser.email);
    console.log('authSendEmailAddressVerificationEmail: Email type:', typeof context.currentUser.email);
    console.log('authSendEmailAddressVerificationEmail: Email length:', context.currentUser.email?.length);
    console.log('authSendEmailAddressVerificationEmail: Language:', context.language || 'en');
    
    // Validate email format
    if (!context.currentUser.email) {
      console.error('authSendEmailAddressVerificationEmail: No email found in currentUser');
      throw new Error('No email address found for this user');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(context.currentUser.email)) {
      console.error('authSendEmailAddressVerificationEmail: Invalid email format:', context.currentUser.email);
      throw new Error('Invalid email format');
    }

    // Rate limiting disabled - users can send unlimited verification emails

    try {
      await EmailService.sendEmailAddressVerification(
        context.currentUser.email,
        context.language || 'en',
        // accountType,
      );
      
      console.log('authSendEmailAddressVerificationEmail: Email sent successfully');
      return true;
    } catch (error) {
      console.error('authSendEmailAddressVerificationEmail: Error sending email:', error);
      
      // If email sending fails, we could consider not counting it against the rate limit
      // For now, we'll leave it as is since the rate limit is already applied
      
      throw error;
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
