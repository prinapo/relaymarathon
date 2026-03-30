const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node set-admin.js USER_UID');
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('✓ Custom claims set for user:', uid);
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ Error:', error);
    process.exit(1);
  });