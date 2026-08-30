const { IDS } = require('../ids');

const IMG = {
  livingRoom:
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200',
  chairs:
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200',
  accessories:
    'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200',
  banquette:
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200',
  sofa:
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  table:
    'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800',
  armchair:
    'https://images.unsplash.com/photo-1586023492125-27b368c04763?w=800',
  console:
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
  hotelLobby:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600',
  showroom:
    'https://images.unsplash.com/photo-1618221195710-dd6b41fa6966?w=1200',
  hero:
    'https://images.unsplash.com/photo-1618220179428-227d75fa013c?w=1920',
  brand:
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400',
};

function buildBrands() {
  return [
    {
      collection: 'brand',
      id: IDS.brandTomoga,
      data: {
        name: { en: 'Tomoga', ar: 'توموجا' },
        imageUrl: IMG.brand,
        isActive: true,
        normalize_nameEn: 'tomoga',
        normalize_nameAr: 'توموجا',
      },
    },
  ];
}

function buildCollections() {
  return [
    {
      collection: 'collection',
      id: IDS.collectionLivingRoom,
      data: {
        name: { en: 'Living Room', ar: 'غرفة المعيشة' },
        subtitle: {
          en: 'Curated comfort for modern living',
          ar: 'راحة مختارة للمعيشة العصرية',
        },
        slug: 'living-room',
        image: { publicUrl: IMG.livingRoom, name: 'living-room.jpg' },
        display_order: 1,
        is_featured: true,
        isActive: true,
      },
    },
    {
      collection: 'collection',
      id: IDS.collectionChairs,
      data: {
        name: { en: 'Chairs', ar: 'كراسي' },
        subtitle: { en: 'Sculptural seating', ar: 'مقاعد نحتية' },
        slug: 'chairs',
        image: { publicUrl: IMG.chairs, name: 'chairs.jpg' },
        display_order: 2,
        is_featured: true,
        isActive: true,
      },
    },
    {
      collection: 'collection',
      id: IDS.collectionAccessories,
      data: {
        name: { en: 'Accessories', ar: 'إكسسوارات' },
        subtitle: { en: 'Finishing touches', ar: 'لمسات نهائية' },
        slug: 'accessories',
        image: { publicUrl: IMG.accessories, name: 'accessories.jpg' },
        display_order: 3,
        is_featured: false,
        isActive: true,
      },
    },
    {
      collection: 'collection',
      id: IDS.collectionBanquette,
      data: {
        name: { en: 'Banquette', ar: 'بانكيت' },
        subtitle: { en: 'Soft landing spaces', ar: 'مساحات ناعمة' },
        slug: 'banquette',
        image: { publicUrl: IMG.banquette, name: 'banquette.jpg' },
        display_order: 4,
        is_featured: false,
        isActive: true,
      },
    },
  ];
}

function buildCategories() {
  return [
    {
      collection: 'category',
      id: IDS.categorySofas,
      data: {
        name: { en: 'Sofas', ar: 'كنب' },
        collection_id: IDS.collectionLivingRoom,
        parent_id: 0,
        level: 1,
        position: 1,
        image: { publicUrl: IMG.sofa, name: 'sofas.jpg' },
        isActive: true,
        isRemoved: false,
      },
    },
    {
      collection: 'category',
      id: IDS.categoryCoffeeTables,
      data: {
        name: { en: 'Coffee Tables', ar: 'طاولات قهوة' },
        collection_id: IDS.collectionLivingRoom,
        parent_id: 0,
        level: 1,
        position: 2,
        image: { publicUrl: IMG.table, name: 'coffee-tables.jpg' },
        isActive: true,
        isRemoved: false,
      },
    },
    {
      collection: 'category',
      id: IDS.categoryArmchairs,
      data: {
        name: { en: 'Armchairs', ar: 'كراسي بذراعين' },
        collection_id: IDS.collectionChairs,
        parent_id: 0,
        level: 1,
        position: 1,
        image: { publicUrl: IMG.armchair, name: 'armchairs.jpg' },
        isActive: true,
        isRemoved: false,
      },
    },
  ];
}

function productBase({
  id,
  titleEn,
  titleAr,
  descEn,
  descAr,
  brandId,
  categoryId,
  collectionId,
  materialEn,
  materialAr,
  image,
  productNo,
  isBestSeller = false,
  popularityScore = 0,
  modules = null,
}) {
  return {
    collection: 'product',
    id,
    data: {
      productNo,
      type: 'single',
      main_title: { en: titleEn, ar: titleAr },
      description: { en: descEn, ar: descAr },
      features: [
        { en: 'Handcrafted with premium materials', ar: 'مصنوع يدوياً بمواد فاخرة' },
        { en: 'Designed for lasting comfort', ar: 'مصمم للراحة الدائمة' },
      ],
      materials: [{ name: materialEn, image_url: image }],
      mechanisms: [],
      brand_id: brandId,
      category_id: categoryId,
      collection_id: collectionId,
      brand: { en: 'Tomoga', ar: 'توموجا' },
      material: { en: materialEn, ar: materialAr },
      warranty: 24,
      warranty_returns_eligible: true,
      warranty_returns_note: {
        en: 'Eligible for return within 30 days of delivery.',
        ar: 'مؤهل للإرجاع خلال 30 يوماً من التسليم.',
      },
      technical_width: 90,
      technical_height: 77,
      technical_depth: 103,
      technical_dimension_unit: 'cm',
      is_best_seller: isBestSeller,
      popularity_score: popularityScore,
      product_modules: modules,
      reviews_count: 12,
      rating: 4.8,
      rating_details: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 8 },
      status: 'active',
    },
  };
}

function buildProducts() {
  const b = IDS.brandTomoga;
  const sofas = IDS.categorySofas;
  const tables = IDS.categoryCoffeeTables;
  const armchairs = IDS.categoryArmchairs;
  const living = IDS.collectionLivingRoom;
  const chairs = IDS.collectionChairs;

  return [
    productBase({
      id: IDS.productOpalSofa,
      titleEn: 'Opal Modular Sofa',
      titleAr: 'كنبة أوبال المعيارية',
      descEn: 'L-shape adaptable seating in soft taupe linen.',
      descAr: 'مقاعد على شكل L قابلة للتكيف بتنجيد كتان بيج ناعم.',
      brandId: b,
      categoryId: sofas,
      collectionId: living,
      materialEn: 'Soft Taupe Linen',
      materialAr: 'كتان بيج ناعم',
      image: IMG.sofa,
      productNo: 1001,
      isBestSeller: true,
      popularityScore: 98,
    }),
    productBase({
      id: IDS.productOrionSofa,
      titleEn: 'Orion Modular Sofa',
      titleAr: 'كنبة أوريون المعيارية',
      descEn: 'Custom configuration with premium walnut base.',
      descAr: 'تكوين مخصص بقاعدة جوز فاخرة.',
      brandId: b,
      categoryId: sofas,
      collectionId: living,
      materialEn: 'Soft Linen Beige / Walnut',
      materialAr: 'كتان بيج / جوز',
      image: IMG.sofa,
      productNo: 1002,
      isBestSeller: true,
      popularityScore: 95,
      modules: [
        { name: '135 Right Curved', width: 135, height: 77, depth: 103 },
        { name: '135 Left Curved', width: 135, height: 77, depth: 103 },
        { name: 'Corner Module', width: 103, height: 77, depth: 103 },
      ],
    }),
    productBase({
      id: IDS.productAaltoTable,
      titleEn: 'Aalto Round Coffee Table',
      titleAr: 'طاولة قهوة آلتو دائرية',
      descEn: 'Classic ash timbers with matte finish — Ø 90cm.',
      descAr: 'خشب رماد كلاسيكي بلمسة مطفية — قطر 90 سم.',
      brandId: b,
      categoryId: tables,
      collectionId: living,
      materialEn: 'Classic Ash Timbers',
      materialAr: 'خشب رماد كلاسيكي',
      image: IMG.table,
      productNo: 1003,
      isBestSeller: true,
      popularityScore: 88,
    }),
    productBase({
      id: IDS.productEliasArmchair,
      titleEn: 'Elias Armchair',
      titleAr: 'كرسي إلياس',
      descEn: 'Corner chair with sculptural walnut frame.',
      descAr: 'كرسي زاوية بإطار جوز نحتي.',
      brandId: b,
      categoryId: armchairs,
      collectionId: chairs,
      materialEn: 'Walnut Frame',
      materialAr: 'إطار جوز',
      image: IMG.armchair,
      productNo: 1004,
      isBestSeller: true,
      popularityScore: 92,
    }),
    productBase({
      id: IDS.productMilanoArmchair,
      titleEn: 'Milano Armchair',
      titleAr: 'كرسي ميلانو',
      descEn: 'Bouclé upholstery with deep seat comfort.',
      descAr: 'تنجيد bouclé براحة مقعد عميقة.',
      brandId: b,
      categoryId: armchairs,
      collectionId: chairs,
      materialEn: 'Bouclé',
      materialAr: 'بوكليه',
      image: IMG.armchair,
      productNo: 1005,
      isBestSeller: false,
      popularityScore: 75,
    }),
    productBase({
      id: IDS.productVeneziaConsole,
      titleEn: 'Venezia Console Table',
      titleAr: 'طاولة فينيزيا كونسول',
      descEn: 'Marble top console with brushed brass details.',
      descAr: 'كونسول برأس رخامي وتفاصيل نحاس مصقول.',
      brandId: b,
      categoryId: tables,
      collectionId: living,
      materialEn: 'Marble Top',
      materialAr: 'رأس رخامي',
      image: IMG.console,
      productNo: 1006,
      isBestSeller: false,
      popularityScore: 70,
    }),
  ];
}

function variantForProduct(productId, variantId, titleEn, titleAr, sku, price, image) {
  return {
    collection: 'product-variants',
    id: variantId,
    data: {
      product_id: productId,
      title: { en: titleEn, ar: titleAr },
      sku,
      main_image: image,
      variant_images: [{ publicUrl: image, name: `${sku}.jpg` }],
      options_values: [{ en: 'Default', ar: 'افتراضي' }],
      status: 'active',
      cost: price * 0.55,
      price,
      currency: 'USD',
      current_price: price,
      onSale: false,
      inventory_quantity: 25,
      max_order_qty: 10,
    },
  };
}

function buildProductVariants() {
  return [
    variantForProduct(
      IDS.productOpalSofa,
      IDS.variantOpalDefault,
      'Opal Modular Sofa',
      'كنبة أوبال المعيارية',
      'TOM-OPAL-001',
      4890,
      IMG.sofa,
    ),
    variantForProduct(
      IDS.productOrionSofa,
      IDS.variantOrionDefault,
      'Orion Modular Sofa',
      'كنبة أوريون المعيارية',
      'TOM-ORION-001',
      6130,
      IMG.sofa,
    ),
    variantForProduct(
      IDS.productAaltoTable,
      IDS.variantAaltoDefault,
      'Aalto Round Coffee Table',
      'طاولة آلتو دائرية',
      'TOM-AALTO-001',
      1120,
      IMG.table,
    ),
    variantForProduct(
      IDS.productEliasArmchair,
      IDS.variantEliasDefault,
      'Elias Armchair',
      'كرسي إلياس',
      'TOM-ELIAS-001',
      1290,
      IMG.armchair,
    ),
    variantForProduct(
      IDS.productMilanoArmchair,
      IDS.variantMilanoDefault,
      'Milano Armchair',
      'كرسي ميلانو',
      'TOM-MILANO-001',
      1890,
      IMG.armchair,
    ),
    variantForProduct(
      IDS.productVeneziaConsole,
      IDS.variantVeneziaDefault,
      'Venezia Console Table',
      'طاولة فينيزيا',
      'TOM-VENZ-001',
      2340,
      IMG.console,
    ),
  ];
}

function buildInventory() {
  return [
    {
      collection: 'inventory',
      id: IDS.inventoryOpal,
      data: {
        productId: IDS.productOpalSofa,
        tracked: true,
        isRemoved: false,
        onHand_quantity: 25,
        available_quantity: 20,
        unavailable_quantity: 2,
        committed_quantity: 3,
      },
    },
    {
      collection: 'inventory',
      id: IDS.inventoryAalto,
      data: {
        productId: IDS.productAaltoTable,
        tracked: true,
        isRemoved: false,
        onHand_quantity: 15,
        available_quantity: 12,
        unavailable_quantity: 1,
        committed_quantity: 2,
      },
    },
    {
      collection: 'inventory',
      id: IDS.inventoryElias,
      data: {
        productId: IDS.productEliasArmchair,
        tracked: true,
        isRemoved: false,
        onHand_quantity: 30,
        available_quantity: 28,
        unavailable_quantity: 0,
        committed_quantity: 2,
      },
    },
  ];
}

function buildCatalogDatasets() {
  return [
    ...buildBrands(),
    ...buildCollections(),
    ...buildCategories(),
    ...buildProducts(),
    ...buildProductVariants(),
    ...buildInventory(),
  ];
}

module.exports = {
  IMG,
  buildCatalogDatasets,
};
