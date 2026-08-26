const AddressEditor = require('../../../services/customer-address/addressEditor');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  addressUpdate(customerId: String, id: String!, data: AddressInput!): Address!
`;

const resolver = {
  addressUpdate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.addressEdit);
    return new AddressEditor(context).update(
      args.customerId,
      args.id,
      args.data
    );
  },
};

exports.schema = schema;
exports.resolver = resolver;
