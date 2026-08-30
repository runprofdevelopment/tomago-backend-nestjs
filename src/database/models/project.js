const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Project extends AbstractEntityModel {
  constructor() {
    super('project', 'project', {
      public_id: new types.String(), // e.g. PRJ-BGH-001
      name: new types.String(),
      slug: new types.String(),
      tagline: new types.String(),
      brief_title: new types.String(),
      client_name: new types.String(), // TODO: confirm FK to user vs free text
      start_date: new types.Date(),
      duration: new types.String(),
      location: new types.String(),
      scope: new types.String(),
      description: new types.String(),
      pieces_delivered: new types.String(),
      design_style: new types.String(),
      category: new types.String(), // e.g. Hospitality
      thumbnail: new types.Avatar(),
      hero_image: new types.Avatar(),
      images: new types.JsonArray(['image_url', 'sort_order']),
      featured_product_ids: new types.StringArray(),
      is_featured: new types.Boolean(false),
      status: new types.Enumerator(
        ['active', 'draft', 'inactive', 'archived'],
        'draft',
      ),
    });
  }
};
