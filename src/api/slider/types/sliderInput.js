const schema = `
  input SliderInput {
    imageEn: AvatarInput
    imageAr: AvatarInput
    startDate: DateTime
    endDate: DateTime
    targetView: TargetPageEnum
    targetId: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;