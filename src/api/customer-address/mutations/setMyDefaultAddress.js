const AddressEditor = require('../../../services/customer-address/addressEditor');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  setMyDefaultAddress(addressId: String!): Boolean
`;

const resolver = {
  setMyDefaultAddress: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.addressEdit);
    const customerId = context.currentUser && context.currentUser.id;
    await new AddressEditor(context).setDefaultAddress(customerId, args.addressId);
    return true
  },
};

exports.schema = schema;
exports.resolver = resolver;
