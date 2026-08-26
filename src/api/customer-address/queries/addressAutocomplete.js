const AddressViewer = require('../../../services/customer-address/addressViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  addressAutocomplete(customerId: String!, fieldName: AddressFieldNameSearchEnum!, search: String, limit: Int, lang: String): [ AutocompleteOption! ]!
`;

const resolver = {
  addressAutocomplete: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.addressAutocomplete);
    return new AddressViewer(context).findAutocomplete(
      args.customerId,
      args.fieldName,
      args.search,
      args.limit,
      args.lang,
    );
  }
};

exports.schema = schema;
exports.resolver = resolver;