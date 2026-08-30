const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class ShowRoom extends AbstractEntityModel {
  constructor() {
    super('showRoom', 'showRoom', {
      name: new types.Localization(),
      description: new types.Localization(),
      project_id: new types.RelationToOne(),
      image: new types.Avatar(),
      address: new types.String(),
      phone: new types.String(),
      email: new types.String(),
      working_hours: new types.String(),
      location: new types.String(),
      isActive: new types.Boolean(true),
    });
  }
};
