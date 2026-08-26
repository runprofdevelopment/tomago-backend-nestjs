const ForbiddenError = require('../../../errors/forbiddenError');
const CustomerCreator = require('../../../services/iam/customerCreator');

const schema = `
  customerCreateAccount(data: CustomerInput!): User
`;

const resolver = {
  customerCreateAccount: async (root, args, context) => {
    const currentUser = context.currentUser;
    if (!currentUser || !currentUser.id) {
      throw new ForbiddenError(context.language);
    }

    const email = currentUser.email;
    // const email = currentUser.providerId == 'google' 
    //   ? currentUser.email 
    //   : args.data.email

    const data = {
      ...args.data,
      email: email,
      authenticationUid: currentUser.authenticationUid,
      providerId: currentUser.providerId,
    }
    
    return await new CustomerCreator(context).execute(data);
  },
};

exports.schema = schema;
exports.resolver = resolver;