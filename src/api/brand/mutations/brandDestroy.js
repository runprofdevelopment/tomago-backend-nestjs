const BrandRemover = require('../../../services/brand/brandRemover');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  brandDestroy(id: String!): Boolean
`;

const resolver = {
  brandDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.brandDestroy);
    await new BrandRemover(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;