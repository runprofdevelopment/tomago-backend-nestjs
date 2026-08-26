const AddressViewer = require('../../../services/customer-address/addressViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  addressList(customerId: String!, filter: [ FilterInput! ], orderBy: String, sortBy: SortByEnum): [ Address! ]
`;

const resolver = {
  addressList: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.addressRead);

    return new AddressViewer(context).listAddresses(args.customerId , {
      filter: args.filter,
      orderBy: args.orderBy,
      sortBy: args.sortBy
    });
  },
};

exports.schema = schema;
exports.resolver = resolver;
