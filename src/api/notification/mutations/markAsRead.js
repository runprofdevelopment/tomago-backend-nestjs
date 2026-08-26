const NotificationEditor = require('../../../services/notification/notificationEditor');
// const PermissionChecker = require('../../../security/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  markAsRead(id: String!): Boolean
`;

const resolver = {
  markAsRead: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.notificationEdit);
    await new NotificationEditor(context).markAsRead(args.id);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
