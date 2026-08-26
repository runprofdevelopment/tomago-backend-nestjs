const NotificationRemover = require('../../../services/notification/notificationRemover');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  notificationDestroy(id: String!): Boolean
`;

const resolver = {
  notificationDestroy: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.notificationDestroy);
    await new NotificationRemover(context).destroy(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
