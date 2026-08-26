const ForbiddenError = require('../../../errors/forbiddenError');
const UserRepository = require('../../../database/repositories/userRepository');
const FirebaseHelper = require('../../../database/utils/firebaseHelper');

const schema = `
  authUpdateEmailVerification: Boolean
`;

const resolver = {
  authUpdateEmailVerification: async (root, args, context) => {
    console.log('authUpdateEmailVerification: Starting email verification update');
    console.log('authUpdateEmailVerification: context.currentUser:', context.currentUser);
    
    if (!context.currentUser) {
      console.log('authUpdateEmailVerification: No currentUser in context, throwing ForbiddenError');
      throw new ForbiddenError(context.language);
    }

    console.log('authUpdateEmailVerification: User authenticated, ID:', context.currentUser.id);
    console.log('authUpdateEmailVerification: Email:', context.currentUser.email);

    try {
      // Update the user's email verification status in the database
      const batch = await FirebaseHelper.createBatch();
      
      await UserRepository.update(context.currentUser.id, {
        emailVerified: true,
        updatedAt: FirebaseHelper.serverTimestamp(),
        updatedBy: context.currentUser.id
      }, {
        currentUser: context.currentUser,
        language: context.language || 'en',
        batch
      });
      
      await FirebaseHelper.commitBatch(batch);
      
      console.log('authUpdateEmailVerification: Email verification status updated successfully');
      return true;
    } catch (error) {
      console.error('authUpdateEmailVerification: Error updating email verification status:', error);
      throw error;
    }
  },
};

exports.schema = schema;
exports.resolver = resolver; 