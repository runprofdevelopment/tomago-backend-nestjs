const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AlgoliaService = require('./algoliaService');
const Variant = new (require('../../database/models/product-variant'));

module.exports = class ProductStatusChanger {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(Variant.collectionName);
  }

  async changeStatus(variant_id, status) {
    try {
      await this._validate(variant_id, status);
      
      const data = { status: status };

      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(variant_id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);

      await AlgoliaService.updateVariant(variant_id, {
        status: status,
        updatedBy: this.currentUser.id,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw error;
    }
  }

  async _validate(variant_id, status) {
    const variant = await this.repository.findDocumentById(variant_id);

    if (!variant) throw new Error('Variant not found');

    // Prevent setting the product status to active if the variant image is not set
    const hasAtLeastOneImage = this._hasAtLeastOneImage(variant.variant_images);
    if (!hasAtLeastOneImage && status === 'active') {
      throw new Error('Product must have at least one image to change status to active');
    }
  }

  _hasAtLeastOneImage(images) {
    images = images || [];

    if (!images.length) return false;

    for (const image of images) {
      if (image['publicUrl'] && image['publicUrl'].trim()) return true;
    }

    return false;
  }

  // async changeStatus(product_id, variant_id, status) {
  //   try {
  //     const data = { status: status };
  //     const batch = await FirebaseHelper.createBatch();
  //     await this.repository.updateDocument(id, data, {
  //       batch,
  //       currentUser: this.currentUser,
  //       language: this.language,
  //     });
  //     await FirebaseHelper.commitBatch(batch);

  //     await AlgoliaService.changeStatus(id, {
  //       status: status,
  //       updatedBy: this.currentUser.id,
  //       updatedAt: new Date(),
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }
};