const AppCheckService = require('../../../infrastructure/appCheckService');

const schema = `
  createAppCheckToken(appId: String!): JSON
`;

const resolver = {
  createAppCheckToken: async (root, args, context) => {
    try {
      const appId =
        args.appId ||
        '1:1094629850015:web:a6f3c036d6ccc6e58d9baa';
      // Token expires in an hour.
      // const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
      const appCheckToken =
        await AppCheckService.createAppCheckToken(appId);

      return appCheckToken;
    } catch (error) {
      console.error('Unable to create App Check token.');
      console.error(error);
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;
