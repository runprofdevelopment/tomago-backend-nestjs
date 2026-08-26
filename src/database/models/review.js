const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Review extends AbstractEntityModel {
  constructor() {
    super('reviews', 'reviews', {
      productId: new types.RelationToOne(),
      title: new types.String(null, 255),
      body: new types.String(null, 1500),
      rating: new types.Number(0, 5, 0),
      media: new types.MediaGallery(),          // media gallery entries => Accepts Images, Videos and 3D Models

      // IF User Not auth
      userName: new types.String(null, 255),
      email: new types.String(null, 255),
    });
  }
};