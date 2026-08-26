const NotificationService = require('../../../services/notification/notificationViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  notificationFind(id: String!): Notification
`;

const resolver = {
  notificationFind: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.notificationRead);
    return new NotificationService(context).findById(args.id);
  }
};

exports.schema = schema;
exports.resolver = resolver;