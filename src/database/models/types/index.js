//#region [ Primitive Types ]
const String = require('./string');
const Number = require('./number');
const Boolean = require('./boolean');
const Date = require('./date');
const DateTime = require('./dateTime');
const Json = require('./json');
//#endregion
 
//#region [ Custom Types ]
const StringArray = require('./stringArray');
const NumberArray = require('./numberArray');
const JsonArray = require('./jsonArray');
const EnumeratorArray = require('./enumeratorArray');

const RelationToMany = require('./relationToMany');
const RelationToOne = require('./relationToOne');
const Enumerator = require('./enumerator');

const Files = require('./files');
const File = require('./file');
const Avatar = require('./avatar');
const Avatars = require('./avatars');
const MediaGallery = require('./mediaGallery');
const MediaGalleryArray = require('./mediaGalleryArray');

const GeoPoint = require('./firestore-geopoint');
const Reference = require('./firestore-reference');
const Localization = require('./localization');
const Url = require('./url');
//#endregion

module.exports = {
  String,
  Number,
  Boolean,
  Date,
  DateTime,
  Json,
    
  StringArray,
  NumberArray,
  JsonArray,
  EnumeratorArray,

  File,
  Files,
  Avatar,
  Avatars,
  MediaGallery,
  MediaGalleryArray ,

  RelationToOne,
  RelationToMany,
  Enumerator,
  GeoPoint,
  Reference,
  Localization,
  Url,
};
