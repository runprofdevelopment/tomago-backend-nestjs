/**
 * Slider catalog sync — Algolia removed; Firestore is the source of truth.
 */
module.exports = class AlgoliaService {
  static async addSliderToAlgolia(_slider) {
    return null;
  }

  static async deleteSliderFromAlgolia(_id) {
    return null;
  }

  static async updateSliderInAlgolia(_id, _record) {
    return null;
  }
};
