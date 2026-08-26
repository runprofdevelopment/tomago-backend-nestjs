const CategoryViewer = require('../../../services/category/categoryViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  retrievingCategoriesTree: [ Category! ]
`;

const resolver = {
  retrievingCategoriesTree: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.categoryRead);
    return new CategoryViewer().retrievingCategoriesTree();
  },
};

exports.schema = schema;
exports.resolver = resolver;