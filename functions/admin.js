const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

module.exports = admin; 