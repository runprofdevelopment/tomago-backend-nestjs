const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Inventory extends AbstractEntityModel {
  /**
   * Inventory state Definition
   * --------------------------
   * On hand inventory => refers to all inventory units that you have at a location. 
   *  On hand inventory is made up of the total of your Committed, Unavailable, and Available inventory.
   * 
   * Available inventory => refers to inventory that you can sell. 
   *  Available inventory isn’t committed to any orders or reserved for any draft orders. 
   *  It also doesn't include inventory that's considered Incoming.
   * 
   * Committed inventory => refers to the number of units that are part of an order but not yet fulfilled. 
   *  When units are part of a draft order, they can’t be purchased by customers and won’t 
   *  count as Committed inventory until the draft becomes an order.
   * 
   * Unavailable inventory => refers to the number of units reserved for draft orders or set aside by apps. 
   *  Unavailable inventory is stocked at your location but it's not available to sell.
   * 
   * Incoming inventory => refers to inventory that’s on its way to your location. 
   *  Incoming inventory isn’t available to sell until it has been received 
   *  and its state has been changed to Available.
   */
  constructor() {
    super('inventory', 'inventory', {
      productId: new types.RelationToOne(),
      tracked: new types.Boolean(true),

      onHand_quantity: new types.Number(0, null, 0),
      available_quantity: new types.Number(0, null, 0),
      unavailable_quantity: new types.Number(0, null, 0),
      committed_quantity: new types.Number(0, null, 0),
    });
  }
};