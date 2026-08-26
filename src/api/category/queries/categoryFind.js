const CategoryViewer = require('../../../services/category/categoryViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  categoryFind(id: Int!, withChildren: Boolean): Category
`;

const resolver = {
  categoryFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryRead);
    return new CategoryViewer().findById(args.id, !!args.withChildren);
  }
};

exports.schema = schema;
exports.resolver = resolver;