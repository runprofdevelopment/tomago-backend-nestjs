const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

// TODO: confirm full fields — only sidebar entry seen in admin UI screenshots
module.exports = class ShowRoom extends AbstractEntityModel {
  constructor() {
    super('showRoom', 'showRoom', {
      name: new types.Localization(),
      project_id: new types.RelationToOne(),
      image: new types.Avatar(),
      location: new types.String(),
      isActive: new types.Boolean(true),
    });
  }
};
