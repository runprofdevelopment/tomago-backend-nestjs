const ReviewEditor = require('../../../services/review/reviewEditor');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  reviewUpdate(productId: String!, reviewId: String!, data: ReviewInput!): Review!
`;

const resolver = {
  reviewUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.reviewEdit);
    return new ReviewEditor(context).update(
      args.productId,
      args.reviewId,
      args.data
    );
  },
};

exports.schema = schema;
exports.resolver = resolver;
