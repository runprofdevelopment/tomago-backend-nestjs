import { customAlphabet } from 'nanoid';

module.exports = class Nanoid {
  
  static generateUniqueDigitId(numOfDigits) {
    const numericAlphabet = '0123456789';
    const length = numOfDigits > 0 ? numOfDigits : 0;
  
    const nanoid = customAlphabet(numericAlphabet, length);
    return nanoid;
  }
}