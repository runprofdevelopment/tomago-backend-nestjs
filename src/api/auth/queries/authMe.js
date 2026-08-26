const { error } = require('firebase-functions/logger');
const ForbiddenError = require('../../../errors/forbiddenError');
const UserRepository = require('../../../database/repositories/userRepository');

const schema = `
  authMe: User!
`;

const resolver = {
  async authMe(root, args, context) {
    if (!context.currentUser || !context.currentUser.id) {
      throw new ForbiddenError(context.language);
    }

    // Fetch fresh user data from database to ensure we have the latest profile information
    try {
      const freshUserData = await UserRepository.findById(context.currentUser.id);
      if (freshUserData) {
        console.log('authMe: Fresh user data fetched from database:', {
          id: freshUserData.id,
          firstName: freshUserData.firstName,
          lastName: freshUserData.lastName,
          phoneNumber: freshUserData.phoneNumber,
          nationality: freshUserData.nationality
        });
        return freshUserData;
      } else {
        console.warn('authMe: No fresh user data found, returning context.currentUser');
        return context.currentUser;
      }
    } catch (error) {
      console.error('authMe: Error fetching fresh user data:', error);
      // Fallback to context.currentUser if database fetch fails
      return context.currentUser;
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
