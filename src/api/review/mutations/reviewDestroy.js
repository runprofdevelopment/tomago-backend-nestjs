const ReviewDestroyer = require('../../../services/review/reviewDestroyer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  reviewDestroy(productId: String!, reviewId: String!): Boolean
`;

const resolver = {
  reviewDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.reviewDestroy);
    await new ReviewDestroyer(context).destroy(args.productId, args.reviewId);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;