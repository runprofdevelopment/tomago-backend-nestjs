const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class TopBanner extends AbstractEntityModel {
  constructor() {
    super('topBanner', 'topBanner', {
      content: new types.String(),
      content_color: new types.String(),
      button_label: new types.String(),
      redirection_type: new types.Enumerator(
        ['deal', 'product', 'collection', 'url'],
        'deal',
      ),
      deal_id: new types.String(),
      visibility: new types.Enumerator(['public', 'private'], 'public'),
      is_active: new types.Boolean(true),
      ribbon_color: new types.String(),
    });
  }
};
