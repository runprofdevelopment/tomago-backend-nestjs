const AdminCreator = require('../../../services/iam/adminCreator');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  adminInvite(data: IamInviteInput!): Boolean
`;

const resolver = {
  adminInvite: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.iamCreate);
    await new AdminCreator(context).execute(args.data);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;