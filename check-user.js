const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'Ujjgeyji7nfnHan0xEeVt63TZPf2';
admin.auth().getUser(uid)
  .then(user => {
    console.log('User found:', user.email);
    console.log('Custom claims:', user.customClaims);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });