/**
 * Razorpay Payment Service Simulation
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  console.log(`[Payment Service] Simulating Razorpay signature verification for order ${orderId}`);
  return true;
};

module.exports = {
  verifyPaymentSignature,
};
