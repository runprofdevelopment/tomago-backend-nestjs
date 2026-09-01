const NotificationService = require('../../../services/notification/notificationViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  listMyNotifications(filter: [ FilterInput! ], sort: [SortInput!], pagination: PaginationInput): NotificationPage!
`;

const resolver = {
  listMyNotifications: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.notificationRead);
    return new NotificationService(context).listWithPagination(args);
  },
};

exports.schema = schema;
exports.resolver = resolver;