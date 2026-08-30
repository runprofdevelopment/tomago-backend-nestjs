const { IDS } = require('../ids');
const { IMG } = require('./catalog');

function buildProjects() {
  return [
    {
      collection: 'project',
      id: IDS.projectBosphorus,
      data: {
        public_id: 'PRJ-BGH-001',
        name: 'The Bosphorus Hotel',
        slug: 'the-bosphorus-hotel',
        tagline:
          'Istanbul, Turkey — Timeless craftsmanship on the edge of the historic waterfront strait.',
        brief_title: 'A Landmark Restoration of Waterfront Grandeur',
        client_name: 'Bosphorus Hospitality Group',
        start_date: '2023-06-01',
        duration: '14 Months',
        location: 'Istanbul, Turkey',
        scope: 'Lobby, Lounge, 120 Guest Suites',
        description:
          'Tomoga furnished the lobby, lounge areas, and 120 guest suites with jewel-toned velvets, brushed brass, and hand-carved walnut — blending Ottoman architectural heritage with contemporary comfort.',
        pieces_delivered: '850+ Bespoke Units',
        design_style: 'Ottoman Contemporary',
        category: 'Hospitality',
        thumbnail: { publicUrl: IMG.hotelLobby, name: 'bosphorus-thumb.jpg' },
        hero_image: { publicUrl: IMG.hotelLobby, name: 'bosphorus-hero.jpg' },
        images: [
          { image_url: IMG.hotelLobby, sort_order: 1 },
          { image_url: IMG.showroom, sort_order: 2 },
          { image_url: IMG.livingRoom, sort_order: 3 },
          { image_url: IMG.chairs, sort_order: 4 },
          { image_url: IMG.sofa, sort_order: 5 },
          { image_url: IMG.table, sort_order: 6 },
        ],
        featured_product_ids: [
          IDS.productEliasArmchair,
          IDS.productAaltoTable,
          IDS.productOpalSofa,
          IDS.productOrionSofa,
        ],
        is_featured: true,
        status: 'active',
      },
    },
  ];
}

function buildShowRooms() {
  return [
    {
      collection: 'showRoom',
      id: IDS.showRoomIstanbul,
      data: {
        name: { en: 'Istanbul Showroom', ar: 'معرض إسطنbul' },
        description: {
          en: 'Visit our flagship atelier on the Bosphorus.',
          ar: 'زوروا أتelierنا الرئيسي على البوسفور.',
        },
        project_id: IDS.projectBosphorus,
        address: 'Bağdat Caddesi No:42, Kadıköy, Istanbul, Turkey',
        phone: '+90 532 123 4567',
        email: 'istanbul@tomoga.com',
        working_hours: 'Mon–Sat 10:00–19:00',
        location: 'Istanbul, Turkey',
        image: { publicUrl: IMG.showroom, name: 'istanbul-showroom.jpg' },
        isActive: true,
      },
    },
    {
      collection: 'showRoom',
      id: IDS.showRoomParis,
      data: {
        name: { en: 'Paris Showroom', ar: 'معرض باريس' },
        description: {
          en: 'European design hub in the 8th arrondissement.',
          ar: 'مركز التصميم الأوروبي في الدائرة الثامنة.',
        },
        project_id: null,
        address: '12 Avenue Montaigne, 75008 Paris, France',
        phone: '+33 1 42 00 00 00',
        email: 'paris@tomoga.com',
        working_hours: 'Tue–Sat 11:00–18:00',
        location: 'Paris, France',
        image: { publicUrl: IMG.showroom, name: 'paris-showroom.jpg' },
        isActive: true,
      },
    },
  ];
}

function buildSliders() {
  return [
    {
      collection: 'slider',
      id: IDS.sliderHero,
      data: {
        imageEn: { publicUrl: IMG.hero, name: 'hero-en.jpg' },
        imageAr: { publicUrl: IMG.hero, name: 'hero-ar.jpg' },
        title: 'Designed for the Way You Live',
        content:
          'Discover handcrafted furniture collections that blend timeless elegance with modern comfort.',
        button_text: 'EXPLORE COLLECTION',
        button_color: '#C0392B',
        button_url: '/collections',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-12-31'),
        targetView: 'ad',
        targetId: IDS.collectionLivingRoom,
        isActive: true,
      },
    },
  ];
}

function buildStaticPages() {
  return [
    {
      collection: 'staticPages',
      id: IDS.staticAbout,
      data: {
        type: 'about_us',
        title: { en: 'Our Story', ar: 'قصتنا' },
        body_html: {
          en: '<p>Crafting timeless furniture since 2012. Bridging classic artisan heritage with contemporary comfort.</p><p>Founded in Istanbul by a multigenerational family of woodworkers.</p>',
          ar: '<p>صناعة أثاث خالد منذ 2012. نجسر بين التراث الحرفي والراحة المعاصرة.</p>',
        },
        image: { publicUrl: IMG.showroom, name: 'about.jpg' },
      },
    },
    {
      collection: 'staticPages',
      id: IDS.staticTerms,
      data: {
        type: 'terms',
        title: { en: 'Terms & Conditions', ar: 'الشروط والأحكام' },
        body_html: {
          en: '<p>By using Tomoga services you agree to our terms of service.</p>',
          ar: '<p>باستخدامك لخدمات توموجا فإنك توافق على الشروط.</p>',
        },
      },
    },
    {
      collection: 'staticPages',
      id: IDS.staticPrivacy,
      data: {
        type: 'privacy',
        title: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
        body_html: {
          en: '<p>We respect your privacy and protect your personal data.</p>',
          ar: '<p>نحترم خصوصيتك ونحمي بياناتك الشخصية.</p>',
        },
      },
    },
    {
      collection: 'staticPages',
      id: IDS.staticFaqs,
      data: {
        type: 'faq',
        title: { en: 'FAQs', ar: 'الأسئلة الشائعة' },
        body_html: {
          en: '<p><strong>Shipping?</strong> Free white-glove delivery on orders over $2,000.</p>',
          ar: '<p><strong>الشحن؟</strong> توصيل مجاني للطلبات فوق 2000 دولار.</p>',
        },
      },
    },
    {
      collection: 'staticPages',
      id: IDS.staticRefund,
      data: {
        type: 'refund_policy',
        title: { en: 'Return & Refund Policy', ar: 'سياسة الإرجاع والاسترداد' },
        body_html: {
          en: '<p>Items may be returned within 30 days of delivery in original condition.</p>',
          ar: '<p>يمكن إرجاع المنتجات خلال 30 يوماً من التسليم.</p>',
        },
      },
    },
  ];
}

function buildVouchers() {
  return [
    {
      collection: 'voucher',
      id: IDS.voucherVip,
      data: {
        voucher_code: 'TOMOGAVIP10',
        voucher_type: 'SALE',
        voucher_amount: '10',
        voucher_amount_type: 'percent',
        user_count: 0,
        use_per_user: 1,
        usage: {},
        search: 10,
        startDate: '2024-01-01',
        endDate: '2027-12-31',
        status: 'active',
        total_uses: 0,
      },
    },
  ];
}

function buildCmsDatasets() {
  return [
    ...buildProjects(),
    ...buildShowRooms(),
    ...buildSliders(),
    ...buildStaticPages(),
    ...buildVouchers(),
  ];
}

module.exports = { buildCmsDatasets };
