const CategoryViewer = require('../../../services/category/categoryViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  categoryAutocomplete(fieldName: String!, search: String, limit: Int, lang: String): [AutocompleteOption!]!
`;

const resolver = {
  categoryAutocomplete: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.categoryAutocomplete);
    return new CategoryViewer().findAutocomplete(
      args.fieldName,
      args.search,
      args.limit,
      args.lang,
    );
  }
};

exports.schema = schema;
exports.resolver = resolver;