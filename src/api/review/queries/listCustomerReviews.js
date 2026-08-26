const ReviewViewer = require('../../../services/review/reviewViewer');
// const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  listCustomerReviews(
    customerId: String!, 
    filter: [ FilterInput! ], 
    orderBy: String, 
    pagination: PaginationInput
  ): ReviewPage!
`;

const resolver = {
  listCustomerReviews: async (root, args, context, info) => {
    return new ReviewViewer(context).listCustomerReviews(args);
  }
};

exports.schema = schema;
exports.resolver = resolver;