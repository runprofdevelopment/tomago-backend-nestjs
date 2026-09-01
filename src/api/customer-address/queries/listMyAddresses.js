const AddressViewer = require('../../../services/customer-address/addressViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  listMyAddresses(filter: [ FilterInput! ], sort: [SortInput!]): [ Address! ]
`;

const resolver = {
  listMyAddresses: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.addressRead);
    const customerId = context.currentUser && context.currentUser.id;
    return new AddressViewer(context).listAddresses(customerId, args);
  },
};

exports.schema = schema;
exports.resolver = resolver;