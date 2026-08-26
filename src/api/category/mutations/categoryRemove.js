const CategoryRemover = require('../../../services/category/categoryRemover');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  categoryRemove(id: Int!): Boolean
`;

const resolver = {
  categoryRemove: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryDestroy);
    await new CategoryRemover(context).markAsDeleted(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;