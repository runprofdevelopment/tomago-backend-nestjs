const types = require('../types');
const AbstractEntityModel = require('../abstractEntityModel');

module.exports = class Pagination extends AbstractEntityModel {
  constructor() {
    super('pagination', 'pagination', {
      page: new types.Number(null, null, 0),
      offset: new types.Number(null, null, 0),
      limit: new types.Number(null, null, 0),
      sortBy: new types.Enumerator(['asc', 'desc'], 'asc'),
      action: new types.Enumerator([
        "current",
        "next",
        "prev",
      ]),
      doc: new types.Json(),
    });
  }
};