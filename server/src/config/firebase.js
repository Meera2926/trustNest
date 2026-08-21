const admin = require('firebase-admin');

// Only initialize if not already initialized
if (!admin.apps.length) {
  // Use service account from env or file
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Default app init (for development without service account)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

module.exports = admin;
