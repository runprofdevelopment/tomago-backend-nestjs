const schema = `
  input CustomerSettingsInput {
    orderUpdatesEnabled: Boolean
    promotionalEmailsEnabled: Boolean
    newCollectionAlertsEnabled: Boolean
    newsletterEnabled: Boolean
    preferredLanguage: String
    defaultCurrency: String
    shippingRegion: String
    twoFactorEnabled: Boolean
    loginAlertsEnabled: Boolean
    passwordLastChangedAt: DateTime
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
