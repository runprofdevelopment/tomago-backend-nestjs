const OptionCreator = require('../../../services/product-options/optionCreator');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  optionCreate(data: ProductOptionInput!): JSON
`;

const resolver = {
  optionCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.optionCreate);
    return new OptionCreator(context).create(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
