const { i18n } = require('../../i18n');
const config = require('../../../config')();
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

module.exports = class ForgetPasswordEmail {
  constructor(language, to, link) {
    this.language = language;
    this.to = to;
    this.link = link;
  }
  // constructor(language, to, context) {
  //   this.language = language;
  //   this.to = to;
  //   this.context = context;
  // }

  get subject() {
    return i18n(
      this.language,
      'emails.passwordReset.subject',
      i18n(this.language, 'app.title'),
    );
  }
};
