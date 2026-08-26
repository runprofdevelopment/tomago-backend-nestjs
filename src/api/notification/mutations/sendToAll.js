const NotificationSender = require('../../../services/notification/notificationSender');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  sendToAll(data: NotificationInput!): JSON
`;

const resolver = {
  sendToAll: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.notificationCreate);
    return new NotificationSender(context).sendNotificationToAllCustomers(args.data);
  },
};

exports.schema = schema;
exports.resolver = resolver;