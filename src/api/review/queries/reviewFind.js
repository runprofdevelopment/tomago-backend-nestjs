const ReviewViewer = require('../../../services/review/reviewViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  reviewFind(productId: String!, reviewId: String!): Review
`;

const resolver = {
  reviewFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.reviewRead);
    return new ReviewViewer(context).findReviewById(args.productId, args.reviewId);
  }
};

exports.schema = schema;
exports.resolver = resolver;