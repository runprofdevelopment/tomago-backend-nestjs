const CategoryEditor = require('../../../services/category/categoryEditor');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  categoryUpdate(id: Int!, data: CategoryUpdateInput!): Category!
`;

const resolver = {
  categoryUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryEdit);
    return new CategoryEditor(context).update(args.id, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;