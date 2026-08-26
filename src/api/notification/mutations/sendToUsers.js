const NotificationSender = require('../../../services/notification/notificationSender');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  sendToUsers(usersIds: [ String! ]!, data: NotificationInput!): JSON
`;

const resolver = {
  sendToUsers: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.notificationCreate);
    return new NotificationSender(context).sendNotificationToRecipients(args.usersIds, args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;