/**
 * Kashier payment gateway has been disabled for Tomago.
 * Use COD or wallet payment methods instead.
 */
const DISABLED_MESSAGE =
  'Online payment gateway (Kashier) is disabled. Use COD or wallet.';

module.exports = class Kashier {
  static generateCustomOrderHash() {
    throw new Error(DISABLED_MESSAGE);
  }

  static generateOrderHash() {
    throw new Error(DISABLED_MESSAGE);
  }

  static async createPaymentSession() {
    throw new Error(DISABLED_MESSAGE);
  }

  static async getPaymentSession() {
    throw new Error(DISABLED_MESSAGE);
  }

  static validateSignature() {
    return false;
  }
};
