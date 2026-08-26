const CategoryCreator = require('../../../services/category/categoryCreator');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  subcategoryCreate(data: SubcategoryInput!): Category!
`;

const resolver = {
  subcategoryCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryCreate);
    return new CategoryCreator(context).createSubcategory(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;