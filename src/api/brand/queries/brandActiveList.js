const BrandViewer = require('../../../services/brand/brandViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  brandActiveList: BrandPage!
`;

const resolver = {
  brandActiveList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.brandRead);
    const result = await new BrandViewer(context).listActiveItems();

    return {
      rows: result,
      count: result.length,
      pagination: { isFirstPage: true, isLastPage: true },
    }
  },
};

exports.schema = schema;
exports.resolver = resolver;