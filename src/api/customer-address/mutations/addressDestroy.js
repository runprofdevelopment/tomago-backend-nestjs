const AddressRemover = require('../../../services/customer-address/addressRemover');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  addressDestroy(customerId: String, id: String!): Boolean
`;

const resolver = {
  addressDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.addressDestroy);
    await new AddressRemover(context).destroy(args.customerId, args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
