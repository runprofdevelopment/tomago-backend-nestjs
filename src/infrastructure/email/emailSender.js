const assert = require('assert');
const config = require('../../../config')();
const nodemailer = require('nodemailer');

/**
 * Handles Email sending
 * - More info: https://nodemailer.com
 */
module.exports = class EmailSender {
  /**
   * The following are the possible fields of an email message.
   * @param {Object} email
   * @param {String|String[]} email.to - Comma separated list or an array of recipients email addresses that will appear on the To: field
   * @param {String|String[]} [email.cc] - Comma separated list or an array of recipients email addresses that will appear on the Cc: field
   * @param {String|String[]} [email.bcc] - Comma separated list or an array of recipients email addresses that will appear on the Bcc: field
   * @param {String} email.subject - The subject of the email
   * @param {*} email.html - The HTML version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: 'http://…'})
   * @param {*} [email.text] - The plaintext version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: '/var/data/…'})
   * @param {Object[]} [email.attachments] - An array of attachment objects (see Using attachments for details). Attachments can be used for embedding images as well.
   */
  constructor(email) {
    this.email = email;
  }

  async send() {
    if (!EmailSender.isConfigured) {
      console.error(`Email provider is not configured. Please configure it at backend/config/<environment>.json.`,);
      return;
    }

    assert(this.email, 'email is required');
    assert(this.email.to, 'email.to is required');
    assert(this.email.subject, 'email.subject is required');
    assert(this.email.html, 'email.html is required');

    const transporter = nodemailer.createTransport(this.transportConfig);
    
    const mailOptions = {
      from: this.from,
      to: this.email.to,
      cc: this.email.cc,
      bcc: this.email.bcc,
      subject: this.email.subject,
      text: this.email.text,
      html: this.email.html,
    };

    console.log(' ************** Email Sender Started ************** ');
    try {
      const SentMessageInfo = await transporter.sendMail(mailOptions);
      return SentMessageInfo;
    } catch (error) {
      console.error(
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      );
      console.error(
        'EMAIL SENDER FAILED: Nodemailer was unable to send the email.',
      );
      console.error(
        'This is likely due to incorrect SMTP credentials in your backend/config/<environment>.js file.',
      );
      console.error('Error details:', error);
      console.error(
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      );
      throw new Error(
        'Failed to send email. Please check server logs for details.',
      );
    }
    // return transporter.sendMail(mailOptions, (err, info) => {
    //   err 
    //     ? console.log('Email Sender Error : ', err) 
    //     : console.log(`...Send Email To (${info.envelope.to}) Successfully`);
    //   // if (err) throw err
    // })
  }

  static get isConfigured() {
    return (!!config.email && !!config.email.host);
  }

  get transportConfig() {
    return config.email;
  }

  get from() {
    return config.email.from;
  }

  static _verifyEmailSenderConfigured() {
    if (!EmailSender.isConfigured) {
      throw new Error(
        `Email provider is not configured. Please configure it at backend/config/<environment>.json.`,
      );
    } 
  }
};