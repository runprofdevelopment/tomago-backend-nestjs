const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class StaticPage extends AbstractEntityModel {
  constructor() {
    super('staticPages', 'staticPages', {
      body_html: new types.Localization(),
    });
  }
};