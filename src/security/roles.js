const { i18n } = require('../i18n');
const _values = require('lodash/values');

/** List of Roles available for the Users. */
class Roles {
  static get values() {
    return {
      owner: 'owner',
      admin: 'admin',
      editor: 'editor',
      viewer: 'viewer',
      customer: 'customer',

      // auditLogViewer: 'auditLogViewer',
      // iamSecurityReviewer: 'iamSecurityReviewer',
      // entityEditor: 'entityEditor',
      // entityViewer: 'entityViewer',
      
      usersEditor: 'usersEditor',
      usersViewer: 'usersViewer',

      brandViewer: 'brandViewer',
      brandEditor: 'brandEditor',
    }
  }

  static labelOf(roleId, languageCode) {
    if (!this.values[roleId]) {
      return roleId;
    }

    const LANGUAGE_CODE = languageCode || 'en';
    return i18n(LANGUAGE_CODE, `roles.${roleId}.label`);
  }

  static descriptionOf(roleId, languageCode) {
    if (!this.values[roleId]) {
      return roleId;
    }

    const LANGUAGE_CODE = languageCode || 'en';
    return i18n(LANGUAGE_CODE, `roles.${roleId}.description`);
  }

  static listRoles({ values, languageCode }) {
    const VALUES = values || this.values;
    const LANGUAGE_CODE = languageCode || 'en';

    return _values(VALUES).map((value) => ({
      id: value,
      value: value,
      label: this.labelOf(value, languageCode),
      description: this.descriptionOf(value, LANGUAGE_CODE),
    }));
  }
}

module.exports = Roles;