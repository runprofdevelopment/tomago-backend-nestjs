const en = {
  app: {
    title: 'Tomago'
  },

  auth: {
    passwordReset: {
      error: `Email not recognized`,
    },
    emailAddressVerificationEmail: {
      error: `Email not recognized`,
    },
    errors: {
      emailAlreadyExists: 'The provided email is already in use by an existing user. Each user must have a unique email.',
    }
  },

  iam: {
    errors: {
      userAlreadyExists: 'User with this email "{0}" already exists',
      userNotFound: 'User not found',
      disablingHimself: `You can't disable yourself`,
      destroyingHimself: `You can't delete yourself.`,
      revokingOwnPermission: `You can't revoke your own owner permission`,
      // revokingOwnPermission: `You can't revoke your own admin permission.`,
    },
  },

  importer: {
    errors: {
      invalidFileEmpty: 'The file is empty',
      invalidFileExcel: 'Only excel (.xlsx) files are allowed',
      invalidFileUpload: 'Invalid file. Make sure you are using the last version of the template.',
      importHashRequired: 'Import hash is required',
      importHashExistent: 'Data has already been imported',
    },
  },

  errors: {
    forbidden: {
      message: 'Forbidden',
      permission: 'You do not have permission to access',
    },
    validation: {
      message: 'An error occurred',
    },
    mobileApp: {
      forbidden: 'Account type must be a client',
    },

    fields_required: `{0} are required`,
    field_required: `{0} is required`,
    shopify_customer_id_not_found: `Please verify your email address first to complete {0}.`,
    customerNotFound: 'The client does not exist in the system.',
    cartNotFound: 'There are no cart related to this ID {0}',
    cartItemEmpty: 'There are no products in the cart to purchase.',
    

    USER_NOT_BELONG_TO_BRANCH: `The current user does not belong to any branch.`,

    BACKEND_ERROR: `This error in backend code, please contact with technical support`,
    PRPDUCT_NOT_FOUND: `Sorry product not found`,
    SELLER_NOT_FOUND: `Sorry seller not found`,
    INSUFFICIENT_FUNDS: `There is not enough balance in the wallet`,
    INVALID_INPUTS: `The {0} is required`,
    INVALID_QUANTITY: `The "quantity" must be greater than zero`, 
    INVALID_IBAN: `{0} is not a valid IBAN`,
    INVALID_SWIFT: `Swift/BIC code is invalid`,
    EMPTY_ITEM: `The "item" must not be empty, but it should be like this { itemId, vendorId, quantity }`, 
    CART_EMPTY: `Your cart is empty, Please select items`,
    OUT_OF_STOCK: `This item is not available in stock`,

    SHOPIFY_PRODUCT_NOT_FOUND: `This product of ID "{0}" not found in system`,
    SHOPIFY_VARIANT_NOT_FOUND: `This varaint id "{0}" not related to this product id "{1}"`,

    NOT_FOUND_WALLET: `Sorry, there are no wallet for your account`,
    NOT_FOUND_USER: `The user not found`,
    NOT_FOUND_CART: `The cart not found`,
    NOT_FOUND_ADDRESS: `The address not found`,
    NOT_FOUND_BANK: `The bank account not found`,
    NOT_FOUND_ITEM: `This item code "{0}" does not exist, you can add it`, 
    NOT_FOUND_DOCUMENT: `There is no document related to this ID "{0}"`,
    USER_REMOVED: `This user has been removed from the system`,

    AUCTION_NOT_FOUND: `There is no auction related to this ID "{0}"`,
    AUCTION_CANNOT_MODIFIED: `The auction is {0}, it cannot be modified`,
    AUCTION_TARGET_PRICE_INVALID: `The maximum target price must be greater than minimum bid`,
    AUCTION_MIN_TARGET_PRICE_INVALID: `The minimum target price must be greater than minimum bid`,
    AUCTION_MIN_BID_AMOUNT: `Bid amount must be greater than {0}`,
    AUCTION_MAX_BID_AMOUNT: `Bid amount must be less than or equal {0}`,
    AUCTION_CANNOT_BID: `This auction cannot be bid on {0}`,
    NOT_RUNNING: 'because it is not available now',
    SHOPIFY_CUSTOMER_NOT_FOUND: 'because the customer does not exist in Shopify',
    nonZeroPaidOrder: 'because the customer does not have an actual pre-paid order',
    AUCTION_RECENTLY_BID: `You have bid recently, you cannot bid until someone else bids`,

    CUSTOMER_EXISTS: `Customer email '{0}' already exists`,
    CUSTOMER_NOT_FOUND: `Authentication Customer not found`,

    INVALID_VARIABLE_STRING: `Variable "{0}" got invalid value {1}; Expected type String; String cannot represent a non string value: {2}`,
    INVALID_VARIABLE_NUMBER: `Variable "{0}" got invalid value {1}; Expected type Number; Number cannot represent a non number value: {2}`,
    INVALID_VARIABLE_OBJECT: `Variable "{0}" got invalid value {1}; Expected type JSON; JSON cannot represent a non json value: {2}`,
    INVALID_VARIABLE_ARRAY: `Variable "{0}" got invalid value {1}; Expected type Array; Array cannot represent a non array value: {2}`,
    INVALID_VARIABLE_LIST: `Variable "{0}" got invalid value "{1}"; Expected value is one of this [{2}]`,
    IS_EMPTY: `Variable "{0}" of {1} is required`,
    NOT_HAVE_ACCESS: `Sorry, you do not have access to the {0}`,
  },

  emails: {
    invitation: {
      subject: `You've been invited to {0}`,
      body: `
        <p>Hello,</p>
        <p>You've been invited to {0}.</p>
        <p>Follow this link to register.</p>
        <p><a href="{1}">{1}</a></p>
        <p>Thanks,</p>
        <p>Your {0} team</p>
      `,
    },
    emailAddressVerification: {
      subject: `Verify your email for {0}`,
      body: `
        <p>Hello,</p>
        <p>Follow this link to verify your email address.</p>
        <p><a href='{0}'>{0}</a></p>
        <p>If you didn’t ask to verify this address, you can ignore this email.</p>
        <p>Thanks,</p>
        <p>Your {1} team</p>
      `,
    },
    passwordReset: {
      subject: `Reset your password for {0}`,
      body: `
        <p>Hello,</p>
        <p>Follow this link to reset your {0} password for your {1} account.</p>
        <p><a href='{2}'>{2}</a></p>
        <p>If you didn’t ask to reset your password, you can ignore this email.</p>
        <p>Thanks,</p>
        <p>Your {0} team</p>
      `,
    },
    welcomeEmail: {
      subject: `Welcome to shamy stores`,
      body: `
        <html>
          <p>Thanks For Taking The Time to Apply, We Received Your Request And We Will Get Back to You After Review.</p>
        </html>
      `,
    },
    porductSerials: {
      subject: `Thanks for using Instant Delivery Engine. {0}`,
      body: `
        <p>Hello,</p>
        <p>Your Codes for this order</p>
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

module.exports = en;