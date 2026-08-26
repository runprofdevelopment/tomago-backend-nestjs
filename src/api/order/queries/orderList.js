const orderViewer = require('../../../services/order/orderViewer');
const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  orderList(filter: [ FilterInput! ], orderBy: String, pagination: PaginationInput): OrderPage!
`;

const resolver = {
  orderList: async (root, args, context, info) => {
    return new orderViewer(context).listWithPagination({
      ...args,
      requestedAttributes: graphqlSelectRequestedAttributes(info, 'rows')
    });
  }
};

exports.schema = schema
exports.resolver = resolver