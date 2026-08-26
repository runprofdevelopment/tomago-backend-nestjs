const { i18n } = require('../../i18n');
const config = require('../../../config')();
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const _get = require("lodash/get");

module.exports = class InvitationEmail {
  constructor(language, to, context) {
    this.language = language;
    this.to = to;
    this.context = context;
  }

  get subject() {
    return i18n(
      this.language,
      'emails.invitation.subject',
      i18n(this.language, 'app.title'),
    );
  }

  get html() {
    const __dirname = path.resolve();
    const filePath = path.join(__dirname, './email-templates/invitation.html');
    
    console.log('filePath =', filePath);
    
    const dashboardUrl = _get(config, "dashboardUrl", undefined);
    
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const field = {
      appTitle: i18n(this.language, 'app.title'),
      link: `${dashboardUrl}/auth/login?email=${this.to}`,
      email: this.to,
      ...this.context,
    }
    const htmlToSend = template(field);
    return htmlToSend;
  }

  // get html() {
  //   return i18n(
  //     this.language, 
  //     'emails.invitation.body',
  //     i18n(this.language, 'app.title'),
  //     `${config.clientUrl}/auth/signup?email=${this.to}`,
  //   );
  // }
};
