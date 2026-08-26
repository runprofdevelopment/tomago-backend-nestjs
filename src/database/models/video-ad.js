const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

// TODO: confirm full fields — only sidebar entry seen in admin UI screenshots
module.exports = class VideoAd extends AbstractEntityModel {
  constructor() {
    super('videoAd', 'videoAd', {
      title: new types.String(),
      video_url: new types.String(),
      thumbnail: new types.Avatar(),
      isActive: new types.Boolean(true),
    });
  }
};
