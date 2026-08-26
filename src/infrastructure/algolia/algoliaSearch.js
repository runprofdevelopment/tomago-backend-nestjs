/**
 * Legacy Algolia client stub.
 * Catalog reads/writes go through Firestore via product/brand/category/slider services.
 */
module.exports = class AlgoliaSearch {
  constructor() {
    this.index = null;
    this.client = null;
  }

  initIndex(_indexName) {
    return this;
  }

  async addObject() {
    return null;
  }

  async addObjects() {
    return null;
  }

  async updateObject() {
    return null;
  }

  async updateObjects() {
    return null;
  }

  async partialUpdateObjects() {
    return null;
  }

  async deleteObject() {
    return null;
  }

  async deleteObjects() {
    return null;
  }

  async search() {
    return { hits: [] };
  }

  async searchV2() {
    return { hits: [] };
  }

  async getObject() {
    return null;
  }

  async getObjects() {
    return [];
  }

  async browseObjects() {
    return [];
  }

  async clearAllObjects() {
    return null;
  }

  async multipleBatch() {
    return null;
  }

  async retrieveAllObjects() {
    return [];
  }

  static get ALGOLIA_CONFIGURATION() {
    return {
      appID: null,
      apiKey: null,
      searchOnly_ApiKey: null,
    };
  }
};
