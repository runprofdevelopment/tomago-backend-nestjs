const libphonenumber = require('google-libphonenumber');

module.exports = class ValidationHelper {
  static isValidPhoneNumber(phoneNumber, regionCode) {
    const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

    // const regionCode = 'US'; // Replace with your ISO 3166-1 two letters country code
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, regionCode);
    return phoneUtil.isValidNumber(number);
  }
  
  static isValidEGPhoneNumber(phoneNumber) {
    const regex = /^(?:\+20)?\s?\d{9,10}$/;
    return regex.test(phoneNumber);
  }

  static isValidEmail(email) {
    // Reference: RFC 2822 General Email Regex
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
  }

  /**
   * Password needs to be at least 8 characters, include at least 1 letter, 1 number and 1 special character
   * @param {String} password 
   * @returns {Boolean}
   */
  static isValidPassword(password) {
    // Password needs to be at least 8 characters, include at least 1 letter, 1 number and 1 special character
    let regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  }
};