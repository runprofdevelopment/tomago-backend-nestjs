const SettingsEditor = require('../../../services/settings/settingsEditor');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  settingsSave(settings: SettingsInput!): Settings
`;

const resolver = {
  settingsSave: async (root, args, context) => {
    // new PermissionChecker(context).validateHas(permissions.settingsEdit);
    return new SettingsEditor(context).save(args.settings);
  },
};

exports.schema = schema;
exports.resolver = resolver;