/**
 * Kashier webhooks disabled for Tomago.
 */
module.exports = async (req, res) => {
  console.warn('Kashier webhook received but payment gateway is disabled');
  return res.status(410).json({
    status: 'disabled',
    message: 'Online payment gateway (Kashier) is disabled',
  });
};
