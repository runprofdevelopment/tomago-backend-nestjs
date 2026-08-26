const BrandStatusChanger = require('../../../services/brand/brandStatusChanger');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  brandDeactivate(id: String!): Boolean
`;

const resolver = {
  brandDeactivate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryEdit);
    await new BrandStatusChanger(context).deactivate(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;