const OptionViewer = require('../../../services/product-options/optionViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  optionFind(id: String!): ProductOption
`;

const resolver = {
  optionFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.optionRead);
    return new OptionViewer(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;