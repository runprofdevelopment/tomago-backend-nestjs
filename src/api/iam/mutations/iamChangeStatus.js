const IamStatusChanger = require('../../../services/iam/iamStatusChanger');
const PermissionChecker = require('../../../services/iam/permissionChecker');
const permissions = require('../../../security/permissions').values;

const schema = `
  iamChangeStatus(ids: [ String! ]!, disabled: Boolean = false): Boolean
`;

const resolver = {
  iamChangeStatus: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.iamEdit);
    const statusChanger = new IamStatusChanger(context);
    await statusChanger.changeStatus(args);
    return true;
  },
};

exports.schema = schema;
exports.resolver = resolver;
