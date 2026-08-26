const CategoryRemover = require('../../../services/category/categoryRemover');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  categoryDestroy(id: Int!): Boolean
`;

const resolver = {
  categoryDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryDestroy);
    await new CategoryRemover(context).deletePermanently(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;