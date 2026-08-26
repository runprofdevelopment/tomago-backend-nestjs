
module.exports = class CartUtils {
  /**
   * Returns the number of items uints in the cart
   * @param {JSON[]} items 
   * @returns {Number} Total number of items uints
   */
  static calculateTotalQty(items) { // Summing the 'quantity' property
    items = items || [];
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return totalQuantity;
  }
};