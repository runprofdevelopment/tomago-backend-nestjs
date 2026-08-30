const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class StaticPage extends AbstractEntityModel {
  constructor() {
    super('staticPages', 'staticPages', {
      type: new types.Enumerator(
        ['faq', 'about_us', 'terms', 'refund_policy', 'privacy'],
      ),
      title: new types.Localization(),
      body_html: new types.Localization(),
      image: new types.Avatar(),
    });
  }
};