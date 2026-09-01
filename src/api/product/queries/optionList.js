const OptionViewer = require('../../../services/product-options/optionViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  optionList(sort: [SortInput!]): [ ProductOption! ]!
`;

const resolver = {
  optionList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.productRead);
    return new OptionViewer(context).listAll(args.sort);
  },
};

exports.schema = schema;
exports.resolver = resolver;