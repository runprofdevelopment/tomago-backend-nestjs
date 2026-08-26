const ReviewCreator = require('../../../services/review/reviewCreator');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  reviewCreate(productId: String!, data: ReviewInput!): Review!
`;

const resolver = {
  reviewCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.reviewCreate);
    return new ReviewCreator(context).create(args.productId, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;
