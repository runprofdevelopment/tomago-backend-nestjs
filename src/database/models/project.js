const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Project extends AbstractEntityModel {
  constructor() {
    super('project', 'project', {
      public_id: new types.String(), // e.g. PRJ-BGH-001
      name: new types.String(),
      client_name: new types.String(), // TODO: confirm FK to user vs free text
      start_date: new types.Date(),
      location: new types.String(),
      scope: new types.String(),
      description: new types.String(),
      thumbnail: new types.Avatar(),
      images: new types.JsonArray(['image_url', 'sort_order']),
      status: new types.Enumerator(
        ['active', 'draft', 'inactive', 'archived'],
        'draft',
      ),
    });
  }
};
