const ContactUsCreator = require('../../../services/contactUs/contactUsCreator');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  contactUsCreate(data: ContactUsInput!): Boolean
`;

const resolver = {
  contactUsCreate: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.contactUsCreate);
    await new ContactUsCreator(context).create(args.data);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;