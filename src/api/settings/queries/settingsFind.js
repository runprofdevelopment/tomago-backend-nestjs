const SettingsView = require('../../../services/settings/settingsView');

const schema = `
  settingsFind: Settings!
`;

const resolver = {
  settingsFind: async (root, args, context) => {
    return new SettingsView(context).findOrCreateDefault();
  },
};

exports.schema = schema;
exports.resolver = resolver;
