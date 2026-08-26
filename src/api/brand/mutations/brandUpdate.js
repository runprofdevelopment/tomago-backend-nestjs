const BrandEditor = require('../../../services/brand/brandEditor');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  brandUpdate(id: String!, data: BrandInput!): JSON
`;

const resolver = {
  brandUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.brandEdit);
    return new BrandEditor(context).update(args.id, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;