const OptionEditor = require('../../../services/product-options/optionEditor');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  optionUpdate(id: String!, data: ProductOptionInput!): JSON
`;

const resolver = {
  optionUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.optionEdit);
    return new OptionEditor(context).update(args.id, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;