const axios  = require('axios');

const { FAWATERK_API_KEY, FAWATERK_BASE_URL } = process.env;
const Headers = {
  'Authorization': `Bearer ${FAWATERK_API_KEY}`,
  'Content-Type': 'application/json',
};
const BaseUrl = FAWATERK_BASE_URL;

module.exports = class Fawaterk {
  // constructor() {
  //   this.Headers = {
  //     'Authorization': `Bearer ${FAWATERK_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   };
  //   this.BaseUrl = FAWATERK_BASE_URL;
  // }


  /**
   * Create a Fawaterak transaction on the selected gateway.
   * @param 
   * @returns {Promise<{ 
   *    status: 'success'|'fail',
   *    data: {
   *        invoice_id: Number,
   *        invoice_key: String,
   *        payment_data: JSON,
   *    }
   * }>}
   */
  static async executePayment() {
    try {
      const END_POINT = '/invoiceInitPay';
      const URL = BaseUrl + END_POINT;

      const data = JSON.stringify({
        "payment_method_id": 4,
        "cartTotal": "100",
        "currency": "EGP",
        "customer": {
          "first_name": "test",
          "last_name": "test",
          "email": "test@test.test",
          "phone": "01000000000",
          "address": "test address"
        },
        "redirectionUrls": {
          "successUrl": "https://dev.fawaterk.com/success",
          "failUrl": "https://dev.fawaterk.com/fail",
          "pendingUrl": "https://dev.fawaterk.com/pending"
        },
        "cartItems": [
          {
            "name": "test",
            "price": "100",
            "quantity": "1"
          }
        ]
      });

      const response = await axios({
        method: 'post',
        url: URL,
        headers: Headers,
        data: data,
      });
           
      return response.data;
    } catch (error) {
      throw error
    }
  }

  /**
   * Retrieve all enabled Payment Methods of your portal account 
   * with the commission charge that the customer may pay on the gateway.
   * @returns {Promise<{ 
   *    paymentId: Number,
   *    name_en: String,
   *    name_ar: String,
   *    redirect: 'true'|'false',
   *    logo: String,
   * }[]>}
   */
  static async getPaymentMethods() {
    try {
      const END_POINT = '/getPaymentmethods';
      const URL = BaseUrl + END_POINT;

      const response = await axios({
        method: 'get',
        url: URL,
        headers: Headers,
      });

      const responseData = response && response.data;
      return responseData && responseData.status == 'success' ? responseData.data : [];
    } catch (error) {
      throw error
    }
  }


  static async getInvoiceData(invoice_id) {
    try {
      const END_POINT = `/getInvoiceData/${invoice_id}`;
      const URL = BaseUrl + END_POINT;

      const response = await axios({
        method: 'get',
        url: URL,
        headers: Headers,
      });

      const responseData = response && response.data;
      return responseData && responseData.status == 'success' ? responseData.data : {};
    } catch (error) {
      throw error
    }
  }
};