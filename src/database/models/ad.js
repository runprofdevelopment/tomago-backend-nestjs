const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Ad extends AbstractEntityModel {
  constructor() {
    super('ads', 'ads', {
      title: new types.String(),
      body_html: new types.Date(),
    });
  }
}