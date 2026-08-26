const NotificationService = require('../../../services/notification/notificationViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions =
  require('../../../security/permissions').values;

const schema = `
  notificationUnread(id: String!): NotificationUnread
`;

const resolver = {
  notificationUnread: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.notificationRead);
    const count = await new NotificationService(
      context,
    ).findUnreadNotificationsCount(args.id);
    return {count};

  },

};

exports.schema = schema;
exports.resolver = resolver;
