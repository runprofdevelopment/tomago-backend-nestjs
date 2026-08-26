const COLLECTION_NAME = 'ad-containers';

const BannerAd = {
  id: 'banner_ad',
  isActive: false,
  content: null,
  textColor: null,
  backgroundColor: null,

  btnText: null,
  targetView: null,
  targetId: null,
}

const VideoAd = {
  id: 'video_ad',
  isActive: false,
  video: {
    id: null,
    name: null,
    sizeInBytes: 0,
    privateUrl: null,
    publicUrl: null,
  },
  boosterImageUrl: null,
  targetView: null,
  targetId: null,
}

const TargetPageEnum = [
  'deal',
  'ad',
]

module.exports = {
  COLLECTION_NAME,
  BannerAd,
  VideoAd,
  TargetPageEnum,
}