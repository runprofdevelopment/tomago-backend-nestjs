// const admin = require('firebase-admin');
const moment = require('moment');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
// const AlgoliaService = require('./algoliaService');
const ProductUtils = require('./productUtils');
// const Product = new (require('../../database/models/product'));
const Variant =
  new (require('../../database/models/product-variant'))();

module.exports = class ProductVariantCreator {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(
      Variant.collectionName,
    );
  }

  async createVariants(product, variants, Batch) {
    try {
      const created_variants = [];
      for (let i = 0; i < variants.length; i++) {
        if (variants[i].variant_images.length > 0) {
          variants[i].main_image =
            variants[i].variant_images[0].publicUrl;
        } 
      }


      const batch =
        Batch || (await FirebaseHelper.createBatch());

      for (const variant of variants) {
        const data = await this._preSave(product, variant);

        const record = await this.repository.createDocument(
          data,
          {
            batch,
            currentUser: this.currentUser,
            language: this.language,
          },
        );
        created_variants.push(record);
      }

      if (!Batch) await FirebaseHelper.commitBatch(batch);

      return created_variants;
    } catch (error) {
      throw error;
    }
  }

  async _preSave(product, data) {
    await this._validate(data);

    const ID = `${FirebaseHelper.newIdNumber()}`;
    const DID = ProductUtils._generateNewDID();
    const variants_options =
      (product && product.variants_options) || [];

    let title = { en: '', ar: '' };
    if (
      variants_options.length &&
      variants_options[0].id === 'default'
    ) {
      // title = { en: 'Default Title', ar: 'العنوان الافتراضي' };
      data.options_values = [
        { en: 'Default Title', ar: 'العنوان الافتراضي' },
      ];
    } else {
      for (const value of data.options_values) {
        title.en += `${value.en} ,`;
        title.ar += `${value.ar} ,`;
      }
    }

    const variant_title = {
      en: title.en.slice(0, -1).trimEnd(),
      ar: title.ar.slice(0, -1).trimEnd(),
    };

    data = {
      ...Variant.cast(data),
      id: ID,
      DID: DID,
      product_id: product.id,
      title: {
        en: `${product.main_title['en']} - ${variant_title['en']}`.replace(
          / - $/,
          '',
        ),
        ar: `${product.main_title['ar']} - ${variant_title['ar']}`.replace(
          / - $/,
          '',
        ),
      },
      current_price: data.price,
    };

    // Propagate product-level localization/spec fields to variant when missing
    const localizationKeys = [
      'country_of_origin',
      'model_name',
      'material',
      'model_number',
      'what_in_box',
      'warranty_returns_note',
      'description',
    ];
    for (const key of localizationKeys) {
      const variantValue = data[key];
      const productValue = product[key];
      const isMissing = variantValue === undefined || variantValue === null;
      if (isMissing && productValue !== undefined && productValue !== null) {
        data[key] = productValue;
      }
    }

    // Propagate dimensions, units, shipping dimensions, and features from product when not provided per variant
    const propagateKeys = [
      // physical dimensions
      'product_length',
      'product_height',
      'product_width_Depth',
      'product_weight',
      'product_length_unit',
      'product_height_unit',
      'product_width_unit',
      'product_weight_unit',
      // shipping dimensions
      'shipping_length',
      'shipping_height',
      'shipping_width_Depth',
      'shipping_weight',
      'shipping_length_unit',
      'shipping_height_unit',
      'shipping_width_unit',
      'shipping_weight_unit',
      // misc
      'features',
    ];
    for (const key of propagateKeys) {
      const variantValue = data[key];
      const productValue = product[key];

      const isMissing =
        variantValue === undefined ||
        variantValue === null ||
        (key === 'features' && Array.isArray(variantValue) && variantValue.length === 0);

      if (isMissing && productValue !== undefined && productValue !== null) {
        data[key] = productValue;
      }
    }
    if ((data.warranty === undefined || data.warranty === null) && (product.warranty !== undefined && product.warranty !== null)) {
      data.warranty = product.warranty;
    }

    if (data && data.title) {
      data['normalize_titleEn'] =
        HelperFunctions.stringNormalization(
          `${data.title['en']}`,
        );
      data['normalize_titleAr'] =
        HelperFunctions.stringNormalization(
          `${data.title['ar']}`,
        );
    }

    // const dateNow = new Date();
    const dateNow = moment().format('YYYY-MM-DD');

    const saleStartDate =
      (data.sale_start_date &&
        new Date(data.sale_start_date)) ||
      null;
    const saleEndDate =
      (data.sale_end_date &&
        new Date(data.sale_end_date)) ||
      null;
    const hasSale =
      data.sale_price > 0 && saleStartDate && saleEndDate
        ? true
        : false;

    if (
      hasSale &&
      dateNow >= saleStartDate &&
      dateNow <= saleEndDate
    ) {
      data['current_price'] = data.sale_price;
      data['onSale'] = true;
      const discount =
        100 - (data.sale_price / data.price) * 100;
      data['ribbon_name'] = Math.round(discount) + '%';
      data['ribbon_color'] = '#FFFEFD';
      data['ribbon_background'] = '#EC8181';
    }

    return data;
  }

  async _validate(data) {
    if (!data.sku) throw new Error(`sku is Required`);
    if (!data.barcodes.length)
      throw new Error(`barcodes is Required`);

    if (!data.price || data.price < 0)
      throw new Error(
        `price must be greater than or equal to 0`,
      );
    if (data.cost && data.cost < 0)
      throw new Error(
        `cost must be greater than or equal to 0`,
      );
    if (
      data.inventory_quantity &&
      data.inventory_quantity < 0
    )
      throw new Error(
        `inventory_quantity must be greater than or equal to 0`,
      );
    if (data.max_order_qty && data.max_order_qty < 0)
      throw new Error(
        `max_order_qty must be greater than or equal to 0`,
      );
    if (data.sale_price && data.sale_price < 0)
      throw new Error(
        `sale_price must be greater than or equal to 0`,
      );

    // const saleStartDate = data.sale_start_date ? moment(data.sale_start_date).format('YYYY-MM-DD') : null;
    // const saleEndDate = data.sale_end_date ? moment(data.sale_end_date).format('YYYY-MM-DD') : null;
    const saleStartDate = HelperFunctions.isDate(
      data.sale_start_date,
    )
      ? moment(data.sale_start_date).format('YYYY-MM-DD')
      : null;
    const saleEndDate = HelperFunctions.isDate(
      data.sale_end_date,
    )
      ? moment(data.sale_end_date).format('YYYY-MM-DD')
      : null;

    if (data.sale_price) {
      // const dateNow = new Date();
      const dateNow = moment().format('YYYY-MM-DD');

      if (!saleStartDate)
        throw new Error(
          `A sale price has been entered. Please provide a valid sale_start_date in the format YYYY-MM-DD.`,
        );
      if (!saleEndDate)
        throw new Error(
          `A sale price has been entered. Please provide a valid sale_end_date in the format YYYY-MM-DD.`,
        );

      if (saleStartDate < dateNow) {
        throw new Error(
          `Invalid "sale_start_date", cannot "sale_start_date" on this date ${moment(
            saleStartDate,
          ).format('YYYY-MM-DD')}`,
        );
      }
      if (saleStartDate >= saleEndDate) {
        throw new Error(
          `The "sale_start_date" must be earlier than the "sale_end_date". Please ensure that the selected "sale_start_date" date is before the "sale_end_date".`,
        );
      }
    }

    const isSksUsed = await ProductUtils.verifySkuUsage(
      data.sku,
    );
    if (isSksUsed) {
      throw new Error(
        `The sku: "${data.sku}" is already in use by an existing item. Each item must have a unique sku.`,
      );
    }

    const duplicates_barcodes = ProductUtils.findDuplicates(
      data.barcodes,
    );
    if (duplicates_barcodes.length) {
      throw new Error(
        `The barcodes: "${duplicates_barcodes.join(
          ', ',
        )}" are duplicated. Each item must have a unique barcode.`,
      );
    }

    // ProductUtils.verifyBarcodesUsage(data.barcodes);
    for (const barcode of data.barcodes) {
      const isBarcodeUsed =
        await ProductUtils.verifyBarcodeUsage(barcode);
      if (isBarcodeUsed) {
        throw new Error(
          `The barcode: "${barcode}" is already in use by an existing item. Each item must have a unique barcode.`,
        );
      }
    }

    // variant_images: new types.Avatars(),
    // options_values: new types.JsonArray(['en', 'ar']),
  }
};
