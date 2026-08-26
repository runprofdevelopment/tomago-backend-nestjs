const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const ProductVariantCreator = require('./productVariantCreator');
const AlgoliaService = require('./algoliaService');
const Product =
  new (require('../../database/models/product'))();

module.exports = class ProductCreator {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(
      Product.collectionName,
    );
  }

  async create(data) {
    try {
      console.log("ProductCreator: Input data received:", JSON.stringify(data, null, 2));
      
      const variants = data.variants;




      data = await this._preSave(data);
      
      console.log("ProductCreator: Data after _preSave:", JSON.stringify(data, null, 2));

      const batch = await FirebaseHelper.createBatch();
      const product_record =
        await this.repository.createDocument(data, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });

      console.log("ProductCreator: Product record created:", JSON.stringify(product_record, null, 2));

      const variants_records =
        await new ProductVariantCreator(
          this.context,
        ).createVariants(product_record, variants, batch);

      console.log("ProductCreator: Variants records created:", JSON.stringify(variants_records, null, 2));

      await FirebaseHelper.commitBatch(batch);

      await AlgoliaService.addProductToAlgolia(
        product_record,
        variants_records,
      );

      return {
        ...product_record,
        variants: variants_records,
      };
    } catch (error) {
      throw error;
    }
  }

  async _preSave(data) {
    const ID = `${FirebaseHelper.newIdNumber()}`;
    if (data && data.variants_options) {
      const OptionViewer =
        new (require('../product-options/optionViewer'))();
      data.variants_options =
        await OptionViewer.listWithValues(
          data.variants_options,
        );
    }

    console.log("ProductCreator: Data before Product.cast:", JSON.stringify({
      model_name: data.model_name,
      model_number: data.model_number,
      description: data.description,
      material: data.material
    }, null, 2));

    const castResult = Product.cast(data);
    
    console.log("ProductCreator: Data after Product.cast:", JSON.stringify({
      model_name: castResult.model_name,
      model_number: castResult.model_number,
      description: castResult.description,
      material: castResult.material
    }, null, 2));

    data = {
      ...castResult,
      id: ID,
      productNo: await FirebaseHelper.newIndex(
        this.collectionName,
        true,
      ),
    };

    if (data.category_id) {
      const categoryViewer = require('../category/categoryViewer');
      const CategoryViewer = new categoryViewer();
      const categories =
        (await CategoryViewer.fetchAllParentsOfChild(
          data.category_id,
        )) || [];

      data['category_ids'] = categories.map(
        (category) => category.id,
      );
      data['categories'] = categories.map(
        (category) => category.name,
      );
    }

    if (data.brand_id) {
      const brand = await FirebaseHelper.findDocument(
        'brand',
        data.brand_id,
      );
      data['brand'] = (brand && brand.name) || null;
    }

    if (data.main_title) {
      data['normalize_main_titleEn'] =
        HelperFunctions.stringNormalization(
          data.main_title,
          'en',
        );
      data['normalize_main_titleAr'] =
        HelperFunctions.stringNormalization(
          data.main_title,
          'ar',
        );
    }

    return data;
  }
};
