const CategoryEditor = require('../../../services/category/categoryEditor');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  categoryMove(id: String!, parentId: String!, position: Int!): Boolean
`;

const resolver = {
  categoryMove: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryEdit);
    await new CategoryEditor(context).moveCategory(
      args.id,
      args.parentId,
      args.position
    );
    return true
  },
};

exports.schema = schema;
exports.resolver = resolver;