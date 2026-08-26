const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Invoice extends AbstractEntityModel {
  constructor() {
    super('invoice', 'invoice', {
      id: new types.String(),
      invoice_number: new types.Number(),
      invoice_amount: new types.Number(),
      currency: new types.String(),
      invoice_date: new types.DateTime(),
      browser_ip: new types.String(),
      items: new types.JsonArray(['name', 'quantity', 'codes']),
      
      creator_name: new types.String(),
      creator_email: new types.String(),
      creator_phone: new types.String(),
      branch_name: new types.String(),

      order_id: new types.RelationToOne(),
      branch_id: new types.RelationToOne(),
    });
  }
};