const auditLogPermissions = require('./auditLogPermissions');
const iamPermissions = require('./iamPermissions');
const userPermissions = require('./userPermissions');
const brandPermissions = require('./brandPermissions');


/** List of Permissions and the Roles allowed of using them. */
module.exports = class Permissions {
  static get values() {
    return {
      // ...auditLogPermissions,
      ...iamPermissions,
      ...userPermissions,
      ...brandPermissions,
    };
  }

  static get asArray() {
    return Object.keys(this.values).map((value) => {
      return this.values[value];
    });
  }
};