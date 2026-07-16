const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

if (!admin.getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.cert(serviceAccount),
      });
    } else {
      // Fallback to initialization using the Project ID
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "vendoros-b2c1d",
      });
    }
    console.log("[Firebase Admin] Initialized successfully");
  } catch (error) {
    console.log("[Firebase Admin] Initialization failed: " + error.message);
  }
}

// Attach a compatible .auth() wrapper to match existing controller usage patterns
admin.auth = () => getAuth();

module.exports = admin;