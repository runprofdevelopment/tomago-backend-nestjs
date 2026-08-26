const CategoryStatusChanger = require('../../../services/category/categoryStatusChanger');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  categoryActivate(id: Int!): Boolean
`;

const resolver = {
  categoryActivate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryEdit);
    await new CategoryStatusChanger(context).activate(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;