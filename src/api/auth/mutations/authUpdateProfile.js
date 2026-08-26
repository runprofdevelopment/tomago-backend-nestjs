const ForbiddenError = require('../../../errors/forbiddenError');
const AuthProfileEditor = require('../../../services/auth/authProfileEditor');

// authUpdateProfile(profile: UserProfileInput!): Boolean
const schema = `
  authUpdateProfile(profile: CombinedProfileInput!): Boolean
`;

const resolver = {
  authUpdateProfile: async (root, { profile }, context) => {
    if (!context.currentUser || !context.currentUser.id) {
      throw new ForbiddenError(context.language);
    }

    const accountType = context.currentUser.accountType;
    const { userInput, adminInput } = profile;

    if (accountType == 'customer') {
      // Logic to handle the user input
      if (!userInput)
        throw new Error(`userInput is required`);

      const currentPhoneNumber =
        context.currentUser.phoneNumber;
      if (
        userInput.phoneNumber &&
        userInput.phoneNumber !== currentPhoneNumber
      ) {
        console.log(
          `Phone number changed from ${currentPhoneNumber} to ${userInput.phoneNumber}`,
        );

        // Set phoneVerified to false
        userInput.phoneVerified = false;
        console.log(
          `Set phoneVerified to false`,
          userInput.phoneVerified,
        );
        console.log(context.currentUser);
      }

      await new AuthProfileEditor(context).execute(
        userInput,
      );
    } else {
      // Logic to handle the admin input
      if (!adminInput)
        throw new Error(`adminInput is required`);

      if (
        userInput.phoneNumber &&
        userInput.phoneNumber !== currentPhoneNumber
      ) {
        console.log(
          `Phone number changed from ${currentPhoneNumber} to ${userInput.phoneNumber}`,
        );

        // Set phoneVerified to false
        userInput.phoneVerified = false;
        console.log(
          `Set phoneVerified to false`,
          userInput.phoneVerified,
        );
        console.log(context.currentUser);
      }

      await new AuthProfileEditor(context).execute(
        adminInput,
      );
    }

    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
