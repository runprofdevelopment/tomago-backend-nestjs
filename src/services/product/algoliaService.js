const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Variant = new (require('../../database/models/product-variant'));

/**
 * Catalog product helpers — previously synced to Algolia.
 * Reads now hydrate from Firestore; write/sync methods are no-ops.
 */
module.exports = class AlgoliaService {
  static async addProductToAlgolia(_product, _variants) {
    // Algolia removed — Firestore is the source of truth
    return null;
  }

  static async changeStatus(_variant_id, _data) {
    return null;
  }

  static async updateProductWithAllVariants(_product_id, _data) {
    return null;
  }

  static async updateVariant(_variant_id, _data) {
    return null;
  }

  static _selectMainImageUrl(images) {
    images = images || [];

    if (!images.length) return null;

    for (const image of images) {
      const url = image['publicUrl'] && image['publicUrl'].trim();
      if (url) return url;
    }

    return null;
  }

  static async _hydrateVariant(variantId) {
    const variant = await FirebaseHelper.findDocument(
      Variant.collectionName,
      variantId,
    );
    if (!variant) return null;

    const productId = variant.product_id;
    const product = productId
      ? await FirebaseHelper.findDocument('product', productId)
      : {};

    const main_image = this._selectMainImageUrl(variant.variant_images);

    return {
      objectID: variant.id,
      ...(product || {}),
      ...variant,
      main_image,
      brandEn: (product?.brand && product.brand.en) || null,
      brandAr: (product?.brand && product.brand.ar) || null,
      categoriesEn: product?.categories
        ? product.categories.map((name) => name.en)
        : [],
      categoriesAr: product?.categories
        ? product.categories.map((name) => name.ar)
        : [],
      product_sku: product?.sku,
      variant_sku: variant.sku,
      product_id: product?.id || productId,
      variant_barcode: variant.barcode,
      variant_id: variant.id,
    };
  }

  static async fetchAlgoliaProducts(variantIds) {
    try {
      if (!variantIds || !variantIds.length) return [];

      const products = await Promise.all(
        variantIds.map((id) => this._hydrateVariant(id)),
      );

      return products
        .filter(Boolean)
        .map((product) => {
          const sale = Number(product?.sale_price) || 0;
          const price = Number(product?.price) || 0;
          const ribbon =
            price > 0 && sale > 0
              ? 100 - (sale / price) * 100 + '%'
              : null;

          return {
            ...product,
            variant_id: product?.objectID || product?.id,
            ribbon_name: ribbon,
          };
        });
    } catch (error) {
      console.error('fetchAlgoliaProducts (Firestore) failed:', error);
      throw new Error(
        'Cannot find product information (ProductID or VariantID may be invalid)',
      );
    }
  }

  static async getObject(variantId) {
    return this._hydrateVariant(variantId);
  }

  static async getObjects(variantIds) {
    if (!variantIds || !variantIds.length) return [];
    const products = await Promise.all(
      variantIds.map((id) => this._hydrateVariant(id)),
    );
    return products.filter(Boolean);
  }
};
