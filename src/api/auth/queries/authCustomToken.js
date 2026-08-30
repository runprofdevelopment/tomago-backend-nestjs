const AuthService = require('../../../services/auth/authService');

const schema = `
  authCustomToken(uid: String!): JSON
`;

const resolver = {
  authCustomToken: async (root, args) => {
    return AuthService.createTokenForUid(args.uid);
  },
};

exports.schema = schema;
exports.resolver = resolver;
