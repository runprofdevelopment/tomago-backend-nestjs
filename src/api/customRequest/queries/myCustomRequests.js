const CustomRequestService = require('../../../services/custom-request/customRequestService');

const schema = `
  myCustomRequests(
    filter: [ FilterInput! ],
    sort: [SortInput!], pagination: PaginationInput
  ): CustomRequestPage!
`;

const resolver = {
  myCustomRequests: async (root, args, context) => {
    return new CustomRequestService(context).myCustomRequests(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;
