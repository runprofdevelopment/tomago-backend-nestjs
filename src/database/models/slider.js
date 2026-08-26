const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Slider extends AbstractEntityModel {
  constructor() {
    super('slider', 'slider', {
      imageEn: new types.Avatar(),
      imageAr: new types.Avatar(),
      title: new types.String(),
      content: new types.String(),
      button_text: new types.String(),
      button_color: new types.String(),
      button_url: new types.String(),
      startDate: new types.DateTime(),
      endDate: new types.DateTime(),
      targetView: new types.Enumerator(['deal', 'ad']),
      targetId: new types.String(),
    });
  }
};