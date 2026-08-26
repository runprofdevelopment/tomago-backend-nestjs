const schema = `
  type Slider {
    id: String
    imageEn: Avatar
    imageAr: Avatar

    startDate: DateTime
    endDate: DateTime
    targetView: TargetPageEnum
    targetId: String

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

// title: Localization
// description: Localization
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;