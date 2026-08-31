const ar = {
    app: {
      title: 'Tomago'
    },
  
    auth: {
      passwordReset: {
        error: `لم يتم التعرف على البريد الإلكتروني`,
      },
      emailAddressVerificationEmail: {
        error: `لم يتم التعرف على البريد الإلكتروني`,
      },
      errors: {
        emailAlreadyExists: 'البريد الإلكتروني المقدم قيد الاستخدام بالفعل من قبل مستخدم حالي. يجب أن يكون لكل مستخدم بريد إلكتروني فريد.',
      }
    },
  
    iam: {
      errors: {
        userAlreadyExists: 'المستخدم بهذا البريد الإلكتروني "{0}" موجود بالفعل',
        userNotFound: 'لم يتم العثور على المستخدم',
        disablingHimself: `لا يمكنك تعطيل نفسك`,
        destroyingHimself: `لا يمكنك حذف نفسك`,
        revokingOwnPermission: `لا يمكنك إلغاء إذن المالك الخاص بك`,
      },
    },
  
    importer: {
      errors: {
        invalidFileEmpty: 'الملف فارغ',
        invalidFileExcel: 'يُسمح فقط بملفات Excel (.xlsx).',
        invalidFileUpload: 'ملف غير صالح. تأكد من أنك تستخدم الإصدار الأخير من القالب.',
        importHashRequired: 'Import hash is required',
        importHashExistent: 'لقد تم بالفعل استيراد البيانات',
      },
    },
  
    errors: {
      forbidden: {
        message: 'ممنوع',
        permission: 'ليس لديك إذن للوصول',
      },
      validation: {
        message: 'حدث خطأ',
      },
      mobileApp: {
        // forbidden: 'يجب أن يكون نوع المستخدم عميل',
        forbidden: 'يجب أن يكون نوع الحساب عميلاً',
      },

      fields_required: `{0} مطلوبة`,
      field_required: `{0} مطلوب`,
      shopify_customer_id_not_found: `يرجى التحقق من عنوان بريدك الإلكتروني أولاً لإكمال {0}`,
      customerNotFound: 'العميل غير موجود في النظام.',
      cartNotFound: 'لا توجد سلة تسوق مرتبطة بهذا المعرف {0}',
      cartItemEmpty: 'لا توجد منتجات في سلة التسوق للشراء',

      USER_NOT_BELONG_TO_BRANCH: `المستخدم الحالي لا ينتمي إلى أي فرع`,

      BACKEND_ERROR: `هذا الخطأ في كود الخلفية ، يرجى الاتصال بالدعم الفني`,
      PRPDUCT_NOT_FOUND: `عذرا المنتج غير موجود`,
      SELLER_NOT_FOUND: `عذرا البائع غير موجود`,
      INSUFFICIENT_FUNDS: `لا يوجد رصيد كافي في المحفظة`,
      INVALID_INPUTS: `{0} مطلوب`,
      INVALID_QUANTITY: `يجب أن تكون "الكمية" أكبر من الصفر`, 
      INVALID_IBAN: `{0} ليس رقم IBAN صالحًا`,
      INVALID_SWIFT: `رمز Swift / BIC غير صالح`,
      EMPTY_ITEM: `يجب ألا يكون "العنصر" فارغًا ، لكن يجب أن يكون مثل هذا {itemId، vendorId، quantity}`, 
      CART_EMPTY: `سلة التسوق الخاصة بك فارغة ، يرجى تحديد العناصر`,
      OUT_OF_STOCK: `هذا المنتج غير متوفر في المخزون`,
      
      SHOPIFY_PRODUCT_NOT_FOUND: `هذا المنتج "{0}" غير موجود في النظام`,
      SHOPIFY_VARIANT_NOT_FOUND: `This varaint id "{0}" not related to this product id "{1}"`,
      
      NOT_FOUND_WALLET: `عذرا ، لا توجد محفظة لحسابك`,
      NOT_FOUND_USER: `المستخدم غير موجود`,
      NOT_FOUND_CART: `العربة غير موجودة`,
      NOT_FOUND_ADDRESS: `العنوان غير موجود`,
      NOT_FOUND_BANK: `لم يتم العثور على الحساب المصرفي`,
      NOT_FOUND_ITEM: `رمز العنصر '{0}' غير موجود ، يمكنك إضافته`, 
      NOT_FOUND_DOCUMENT: `لا يوجد مستند متعلق بهذا المعرف '{0}'`,
      USER_REMOVED: `هذا المستخدم تم حذفه من النظام`,
  
      AUCTION_NOT_FOUND: `لا يوجد مزاد مرتبط بهذا المعرف '{0}'`,
      AUCTION_CANNOT_MODIFIED: `المزاد {0}، لا يمكن تعديله`,
      AUCTION_TARGET_PRICE_INVALID: `يجب أن يكون السعر المستهدف "maxTargetPrice" أكبر من الحد الأدنى لعرض التسعير "minimumBid"`,
      AUCTION_MIN_TARGET_PRICE_INVALID: `يجب أن يكون السعر المستهدف "minTargetPrice" أكبر من الحد الأدنى لعرض التسعير "minimumBid"`,
      AUCTION_MIN_BID_AMOUNT: `يجب أن يكون مبلغ المزايدة أكبر من {0}`,
      AUCTION_MAX_BID_AMOUNT: `يجب أن يكون مبلغ المزايدة أقل من أو يساوي {0}`,
      AUCTION_CANNOT_BID: 'لا يمكن المزايدة على هذا المزاد {0}',
      nonZeroPaidOrder: 'لأن العميل ليس لديه طلب فعلي مسبق الدفع',
      SHOPIFY_CUSTOMER_NOT_FOUND: 'لأن العميل غير موجود في Shopify',
      NOT_RUNNING: 'لأنه غير متاح الآن',
      AUCTION_RECENTLY_BID: `لقد قمت بالمزايدة مؤخرًا، لا يمكنك المزايدة حتى يقوم شخص آخر بالمزايدة`,

      CUSTOMER_EXISTS: `البريد الإلكتروني للعميل '{0}' موجود بالفعل`,
      CUSTOMER_NOT_FOUND: `لم يتم العثور على مصادقة العميل`,

      INVALID_VARIABLE_STRING: `حصل المتغير '{0}' على قيمة غير صالحة {1} ؛ النوع المتوقع String؛ لا يمكن أن تمثل السلسلة قيمة غير سلسلة: {2}`,
      INVALID_VARIABLE_NUMBER: `حصل المتغير '{0}' على قيمة غير صالحة {1} ؛ رقم النوع المتوقع ؛ لا يمكن أن يمثل الرقم قيمة غير رقمية: {2}`,
      INVALID_VARIABLE_OBJECT: `حصل المتغير '{0}' على قيمة غير صالحة {1} ؛ النوع المتوقع JSON ؛ لا يمكن أن يمثل JSON قيمة بخلاف json: {2}`,
      INVALID_VARIABLE_ARRAY: `حصل المتغير '{0}' على قيمة غير صالحة {1} ؛ صفيف النوع المتوقع ؛ لا يمكن أن تمثل المصفوفة قيمة ليست مصفوفة: {2}`,
      INVALID_VARIABLE_LIST: `المتغير '{0}' حصل على قيمة غير صالحة "{1}"؛ القيمة المتوقعة هي واحدة من هذا [{2}]`,
      IS_EMPTY: `المتغير '{0}' من {1} مطلوب`,
      NOT_HAVE_ACCESS: `عذرًا ، ليس لديك حق الوصول إلى {0}`,
    },
  
    emails: {
      invitation: {
        subject: `لقد تمت دعوتك إلى {0}`,
        body: `
          <p>مرحبًا،</p>
          <p>لقد تمت دعوتك إلى {0}.</p>
          <p>اتبع هذا الرابط للتسجيل.</p>
          <p><a href="{1}">{1}</a></p>
          <p>شكرًا،</p>
          <p>فريقك {2}.</p>
        `,
      },
      emailAddressVerification: {
        subject: `تحقق من بريدك الإلكتروني لـ {0}`,
        body: `
          <p>مرحبًا،</p>
          <p>اتبع هذا الرابط للتحقق من عنوان بريدك الإلكتروني.</p>
          <p><a href='{0}'>{0}</a></p>
          <p>إذا لم تطلب التحقق من هذا العنوان، فيمكنك تجاهل هذا البريد الإلكتروني.</p>
          <p>شكرًا،</p>
          <p>فريقك {1}.</p>
        `,
      },
      passwordReset: {
        subject: `إعادة تعيين كلمة مرورك لـ {0}`,
        body: `
          <p>مرحبًا،</p>
          <p>اتبع هذا الرابط لإعادة تعيين كلمة مرور {0} لحسابك {1}.</p>
          <p><a href='{2}'>{2}</a></p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور الخاصة بك، فيمكنك تجاهل هذه الرسالة الإلكترونية.</p>
          <p>شكرًا،</p>
          <p>فريقك {3}.</p>
        `,
      },
      welcomeEmail: {
        subject: `مرحبا بكم في محلات الشامي`,
        body: `
          <html>
            <p>شكرا لك علي التقديم في تطبيق رحال لقد تلقينا طلبك وسوف نقوم بالردعليك بعد مراجعة البيانات المقدمة</p>
          </html>
        `,
      },
      porductSerials: {
        subject: `شكرًا لاستخدامك محرك التسليم الفوري. {0}`,
        body: `
          <p>مرحبًا،</p>
          <p>الرموز الخاصة بك لهذا الطلب</p>
          <p>{0}</p>
        `,
      },
    },

    roles: {
      owner: {
        label: `Owner`,
        description: `Full access to all resources`
      },
      admin: {
        label: `Admin`,
        description: `Full access to all resources`
      },
      editor: {
        label: `Editor`,
        description: `Edit access to all resources`
      },
      viewer: {
        label: `Viewer`,
        description: `View access to all resources`
      },
      // auditLogViewer: {
      //   label: `Audit Log Viewer`,
      //   description: `Access to view audit logs`
      // },
      // iamSecurityReviewer: {
      //   label: `Security Reviewer`,
      //   description: `Full access to manage users roles`
      // },
      // entityEditor: {
      //   label: `Entity Editor`,
      //   description: `Edit access to all entities`
      // },
      // entityViewer: {
      //   label: `Entity Viewer`,
      //   description: `View access to all entities`
      // },
      usersEditor: {
        label: `Users Editor`,
        description: `Edit access to users`
      },
      usersViewer: {
        label: `Users Viewer`,
        description: `View access to users`
      },
      notificationEditor: {
        label: `Notification Editor`,
        description: `Edit access to notification`
      },
      notificationViewer: {
        label: `Notification Viewer`,
        description: `View access to notification`
      },
      providerCategoryEditor: {
        label: `Provider Category Editor`,
        description: `Edit access to provider category`
      },
      providerCategoryViewer: {
        label: `Provider Category Viewer`,
        description: `View access to provider category`
      },
      providerProductEditor: {
        label: `Provider Product Editor`,
        description: `Edit access to provider product`
      },
      providerProductViewer: {
        label: `Provider Product Viewer`,
        description: `View access to provider product`
      },
      resendCodeAction: {
        label: `Resend Code Action`,
        description: ``
      },
      providerOrderViewer: {
        label: `Provider Order Viewer`,
        description: `View access to provider order`
      },
      providerWalletViewer: {
        label: `Provider Wallet Viewer`,
        description: `View access to provider wallet`
      },
      mobileAuctionEditor: {
        label: `Auction Editor`,
        description: `Edit access to auction`
      },
      mobileAuctionViewer: {
        label: `Auction Viewer`,
        description: `View access to auction`
      },
      mobileSidebarEditor: {
        label: `Sidebar Editor`,
        description: `Edit access to sidebar`
      },
      mobileSidebarViewer: {
        label: `Sidebar Viewer`,
        description: `View access to sidebar`
      },
      mobileSliderEditor: {
        label: `Slider Editor`,
        description: `Edit access to slider`
      },
      mobileSliderViewer: {
        label: `Slider Viewer`,
        description: `View access to slider`
      },
      settingsEditor: {
        label: `Settings Editor`,
        description: `Edit access to settings`
      },
      settingsViewer: {
        label: `Settings Viewer`,
        description: `View access to settings`
      },
  
      // manager: {
      //   label: `Manager`,
      //   description: `Access to Branch resources and wallet view`
      // },
      // financial: {
      //   label: `Financial`,
      //   description: `Access to most  resources`
      // }
    },
  };
  
module.exports = ar;
  