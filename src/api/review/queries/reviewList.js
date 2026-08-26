const ReviewViewer = require('../../../services/review/reviewViewer');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;
// const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  reviewList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): ReviewPage!
`;

const resolver = {
  reviewList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.reviewRead);
    return new ReviewViewer(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;