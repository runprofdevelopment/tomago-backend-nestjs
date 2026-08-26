const BrandViewer = require('../../../services/brand/brandViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  brandList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): BrandPage!
`;

const resolver = {
  brandList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.brandRead);
    return new BrandViewer(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;