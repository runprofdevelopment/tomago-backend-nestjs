const schema = `
  type MediaGallery {
    name: String
    privateUrl: String
    publicUrl: String
    mediaType: MediaTypeEnum
  }
  
  input MediaGalleryInput {
    name: String
    privateUrl: String
    publicUrl: String!
    mediaType: MediaTypeEnum!
  }

  enum MediaTypeEnum {
    image
    video
    Model
    file
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
