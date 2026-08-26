const ReviewViewer = require('../../../services/review/reviewViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  findProductReviews(productId: String!, filter: [ FilterInput! ], orderBy: String, sortBy: SortByEnum): [ Review! ]
`;

const resolver = {
  findProductReviews: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.reviewRead);
    return new ReviewViewer(context).findProductReviews(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;