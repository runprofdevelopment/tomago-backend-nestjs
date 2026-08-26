const ReturnService = require('../../../services/order-return/returnService');
const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
viewReturnRequests(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): ReturnPage!
`;

const resolver = {
  viewReturnRequests: async (root, args, context, info) => {
    return await new ReturnService(
      context,
    ).listReturnRequests({
      ...args,
      requestedAttributes: graphqlSelectRequestedAttributes(
        info,
        'rows',
      ),
    });
  },
};

exports.schema = schema;
exports.resolver = resolver;

// orderList: async (root, args, context, info) => {
//   return new orderViewer(context).listWithPagination({
//     ...args,
//     requestedAttributes: graphqlSelectRequestedAttributes(
//       info,
//       'rows',
//     ),
//   });
// };
