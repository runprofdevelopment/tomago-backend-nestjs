const CategoryViewer = require('../../../services/category/categoryViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;
const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  categoryList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): CategoryPage!
`;

const resolver = {
  categoryList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.categoryRead);
    return new CategoryViewer().listWithPagination({
      ...args,
      requestedAttributes: graphqlSelectRequestedAttributes(info, 'rows'),
    });
  },
};

exports.schema = schema;
exports.resolver = resolver;