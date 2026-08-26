const BrandViewer = require('../../../services/brand/brandViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  brandFind(id: String!): Brand
`;

const resolver = {
  brandFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.brandRead);
    return new BrandViewer(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;