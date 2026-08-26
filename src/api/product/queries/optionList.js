const OptionViewer = require('../../../services/product-options/optionViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  optionList(orderBy: String, sortBy: SortByEnum): [ ProductOption! ]!
`;

const resolver = {
  optionList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.productRead);
    return new OptionViewer(context).listAll();
  },
};

exports.schema = schema;
exports.resolver = resolver;