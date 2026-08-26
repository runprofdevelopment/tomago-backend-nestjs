const admin = require('firebase-admin');
const HelperFunctions = require('../../utils/helperFunctions');
const Product = new (require('../../database/models/product'));
const Variant = new (require('../../database/models/product-variant'));

module.exports = class ProductUtils {
  static async verifyBarcodesUsage(barcodes) {
    const ref = admin.firestore().collection(Variant.collectionName);
    const query = ref.where('barcodes', 'array-contains-any', barcodes);
    const snapshot = await query.count().get();
    const count = snapshot.data().count;
    return count > 0;
  }

  static async verifyBarcodeUsage(barcode) {
    const ref = admin.firestore().collection(Variant.collectionName);
    const query = ref.where('barcodes', 'array-contains', barcode);
    const snapshot = await query.count().get();
    const count = snapshot.data().count;
    return count > 0;
  }

  static async verifySkuUsage(sku) {
    const ref = admin.firestore().collection(Variant.collectionName);
    const query = ref.where('sku', '==', sku);
    const snapshot = await query.count().get();
    const count = snapshot.data().count;
    return count > 0;
  }

  static findDuplicates(arr) {
    let seen = new Set();
    let duplicates = new Set();
  
    for (let item of arr) {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    }
  
    return [...duplicates];
  }

  static _generateNewDID() {
    // const uniqueDigits = Nanoid.generateUniqueDigitId(8);
    // const uniqueDigits = this.generateUniqueId();
    const uniqueDigits = HelperFunctions.generateUniqueRandomDigits(8);
    return `DX${uniqueDigits}`;
  }
  
  static generateUniqueId() {
    const crypto = require('crypto');
    const byteLength = 4; // 4 bytes = 8 hexadecimal digits
    const randomBytes = crypto.randomBytes(byteLength);
    const uniqueId = randomBytes.toString('hex');
    return uniqueId;
  }
};