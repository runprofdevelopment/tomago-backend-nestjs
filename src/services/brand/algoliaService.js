/**
 * Brand catalog sync — Algolia removed; Firestore is the source of truth.
 */
module.exports = class AlgoliaService {
  static async addBrandToAlgolia(_brand) {
    return null;
  }

  static async updateBrandInAlgolia(_id, _record) {
    return null;
  }

  static async deleteBrandFromAlgolia(_id) {
    return null;
  }
};
