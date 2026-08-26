const UserRepository = require('../../../database/repositories/userRepository');
const PermissionChecker = require('../../../services/iam/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  iamFind(id: String!): User!
`;

const resolver = {
  iamFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.iamRead);
    return UserRepository.findById(args.id);
  },
};

exports.schema = schema;
exports.resolver = resolver;
