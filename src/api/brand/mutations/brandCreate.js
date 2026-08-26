const BrandCreator = require('../../../services/brand/brandCreator');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  brandCreate(data: BrandInput!): JSON
`;

const resolver = {
  brandCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.brandCreate);
    return new BrandCreator(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;