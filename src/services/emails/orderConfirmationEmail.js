const { i18n } = require("../../i18n");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const moment = require("moment");
const config = require('../../../config')();
const _get = require("lodash/get");

module.exports = class OrderConfirmationEmail {
  constructor({ language, to, cc, order, attachments }) {
    this.language = language;
    this.to = to;
    this.cc = cc;
    this.order = order;
    this.attachments = attachments;
  }

  get subject() {
    return i18n(
      this.language,
      `Decoopa | Order Confirmation | Ref#${this.order.refNumber}`
    );
  }

  get html() {
    const __dirname = path.resolve();
    const filePath = path.join(__dirname, "./email-templates/orderConfirmation.html");
    console.log("filePath =", filePath);
    let source = fs.readFileSync(filePath, "utf-8").toString();

    const template = handlebars.compile(source);
    const context = this._generateData();
    const htmlToSend = template(context);

    return htmlToSend;
  }

  _generateData() {
    // const { PaymentTypeEnum } = require('../pricingRule/enums');
    // const supportPhone = _get(config, "supportPhone", undefined);
    // const mailTo = _get(config, "mailTo", undefined);
    // const clientUrl = _get(config, "clientUrl", undefined);
    // const googleAppUrl = _get(config, "googleAppUrl", undefined);
    // const appleAppUrl = _get(config, "appleAppUrl", undefined);
    // const phoneNumber = `${this.booking.country_code}${this.booking.phoneNumber}`;

    const order = this.order || {};
    const createdAt = this.order?.createdAt || new Date();
    
    const ALL_DEPENDENCIES = this.booking.dependents || [];
    const dependents = ALL_DEPENDENCIES.map((dependent) => {
      return {
        name: `${dependent.firstName} ${dependent.lastName}`,
        age: dependent.age,
        relationship: dependent.relationship,
      };
    });

    const items = order.items.map((item) => {
      return {
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      }
    });

    const data = {
      orderNo: order.id,
      customerName: order?.userInfo?.fullName || order?.userInfo?.firstName,
      // createdAt: moment(createdAt).format("DD MMM YYYY"),
      createdAt: moment(createdAt).format("MMM DD, YYYY"),
      items: items,
      paymentMethod: order?.paymentMethod,
      subtotal: order?.subTotalPrice,
      totalPrice: order?.totalPrice,
      address: order?.billingInfo?.address,
      fullName: order?.billingInfo?.firstName + " " + order?.billingInfo?.lastName,
      phoneNumber: order?.billingInfo?.phoneNumber,
    }

    return data;
  }
};