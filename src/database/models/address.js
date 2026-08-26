const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Address extends AbstractEntityModel {
  constructor() {
    super('addresses', 'addresses', {
      id: new types.String(),
      address: new types.String(),
      area: new types.String(),
      city: new types.String(),
      province: new types.String(),
      country: new types.String(),
      province_code: new types.String(),
      country_code: new types.String(),
      zip: new types.String(),
      address_label: new types.Enumerator(['home', 'work']),
      lat: new types.Number(-90, 90),
      lng: new types.Number(-180, 180),
      center: new types.GeoPoint(),
      default: new types.Boolean(),

    //#region [ Customer contact details ]
      customer_id: new types.String(),
      name: new types.String(),
      first_name: new types.String(),
      last_name: new types.String(),
      phoneNumber: new types.String(),
      phoneVerified: new types.Boolean(false),
      // company: new types.String(),
    //#endregion

      // addressLabel: new types.String(),
      // state: new types.String(),
      // street: new types.String(),
      // buildingNo: new types.Number(),
      // floorNo: new types.Number(),
      // flatNo: new types.Number(),
      // timeZone: new types.String(),
      // postalCode: new types.Number(),
      // zipCode: new types.Number(),
      // lat: new types.Number(-90, 90),
      // lng: new types.Number(-180, 180),
      // center: new types.GeoPoint(),
      // notes: new types.String(),
      // isDefault: new types.Boolean(),
    });
  }
};