const orderViewer = require('../../../services/order/orderViewer');
const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  listCustomerOrders(
    customerId: String!, 
    filter: [ FilterInput! ], 
    sort: [SortInput!], pagination: PaginationInput
  ): OrderPage!
`;

const resolver = {
  listCustomerOrders: async (root, args, context, info) => {
    return new orderViewer(context).listCustomerOrders(args);
  }
};

exports.schema = schema
exports.resolver = resolver