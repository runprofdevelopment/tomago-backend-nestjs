const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Slider extends AbstractEntityModel {
  constructor() {
    super('slider', 'slider', {
      imageEn: new types.Avatar(),
      imageAr: new types.Avatar(),
      startDate: new types.DateTime(),
      endDate: new types.DateTime(),
      targetView: new types.Enumerator(['deal', 'ad']),
      targetId: new types.String(),
    });
  }
};