const CustomRequestService = require('../../../services/custom-request/customRequestService');

const schema = `
  customRequestList(
    filter: [ FilterInput! ],
    sort: [SortInput!], pagination: PaginationInput
  ): CustomRequestPage!
`;

const resolver = {
  customRequestList: async (root, args, context) => {
    return new CustomRequestService(context).list(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;
