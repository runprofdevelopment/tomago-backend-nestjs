const NotificationSender = require('../../../services/notification/notificationSender');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  notifyUser(usersId: String!, data: NotificationInput!): JSON
`;

const resolver = {
  notifyUser: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.notificationCreate);
    const usersIds = [args.usersId]
    return new NotificationSender(context).sendNotificationToRecipients(usersIds, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;