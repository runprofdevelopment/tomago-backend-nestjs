const UserRepository = require('../../../database/repositories/userRepository');
const PermissionChecker = require('../../../services/iam/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  iamListRoles(filter: IamListRolesFilterInput, orderBy: RoleWithUsersOrderByEnum): [RoleWithUsers!]!
`;

const resolver = {
  iamListRoles: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.iamRead);
    return UserRepository.findAllWithUsers(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;