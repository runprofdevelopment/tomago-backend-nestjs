const ReviewViewer = require('../../../services/review/reviewViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  reviewAutocomplete(entityName: ReviewalTypeEnum!, entityId: String!, search: String, limit: Int, lang: String): [AutocompleteOption!]!
`;

const resolver = {
  reviewAutocomplete: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.reviewAutocomplete);
    const entityName = args.entityName
    const entityId = args.entityId
    return new ReviewViewer({ ...context, entityName, entityId }).findAutocomplete(
      args.search,
      args.limit,
      args.lang,
    );
  }
};

exports.schema = schema;
exports.resolver = resolver;
