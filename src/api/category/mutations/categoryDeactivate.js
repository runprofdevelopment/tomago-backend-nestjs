const CategoryStatusChanger = require('../../../services/category/categoryStatusChanger');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  categoryDeactivate(id: Int!): Boolean
`;

const resolver = {
  categoryDeactivate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryEdit);
    await new CategoryStatusChanger(context).deactivate(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;