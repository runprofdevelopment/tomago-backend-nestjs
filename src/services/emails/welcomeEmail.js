const { i18n } = require('../../i18n');

module.exports = class WelcomeEmail {
  constructor(language, to) {
    this.language = language;
    this.to = to;
    // this.name = name;
  }

  get subject() {
    return i18n(
      this.language,
      'emails.welcomeEmail.subject',
      i18n(this.language, 'app.title'),
    );
  }

  get html() {
    return i18n(
      this.language,
      'emails.welcomeEmail.body',
      i18n(this.language, 'app.title')
    );
  }

  get text() {
    return `Rahal generated mail placeholder`
  }
};
