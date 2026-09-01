const AddressViewer = require('../../../services/customer-address/addressViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  listCustomerAddresses(customerId: String!, filter: [ FilterInput! ], sort: [SortInput!]): [ Address! ]
`;

const resolver = {
  listCustomerAddresses: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.addressRead);
    if (!args.customerId) throw new Error('customerId is required');
    
    return new AddressViewer(context).listAddresses(args.customerId, {
      filter: args.filter,
      sort: args.sort,
    });
  },
};

exports.schema = schema;
exports.resolver = resolver;