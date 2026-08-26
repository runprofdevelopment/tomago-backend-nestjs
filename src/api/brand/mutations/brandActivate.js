const BrandStatusChanger = require('../../../services/brand/brandStatusChanger');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  brandActivate(id: String!): Boolean
`;

const resolver = {
  brandActivate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.categoryEdit);
    await new BrandStatusChanger(context).activate(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
