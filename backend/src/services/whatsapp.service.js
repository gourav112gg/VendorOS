/**
 * WhatsApp Business Cloud API Simulation Service
 */
const sendWhatsAppAlert = async (recipient, templateName, parameters) => {
  console.log(`[WhatsApp Service] Simulating alert to ${recipient} using template ${templateName}`);
  console.log(`[WhatsApp Service] Parameters:`, parameters);
  return { success: true, messageId: `msg_${Math.random().toString(36).substring(7)}` };
};

module.exports = {
  sendWhatsAppAlert,
};
