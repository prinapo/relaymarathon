const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

let serviceAccount;
try {
  const fs = require('fs');
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } else {
    throw new Error('File not found');
  }
} catch (e) {
  console.error('Service account not found:', e.message);
  console.error('Please download from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();

async function setGlobalAdmin(email) {
  try {
    const user = await auth.getUserByEmail(email);
    console.log(`Found user: ${user.email} (${user.uid})`);
    
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`✓ Set admin=true for ${user.email}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function checkUser(email) {
  try {
    const user = await auth.getUserByEmail(email);
    console.log(`User: ${user.email} (${user.uid})`);
    console.log(`Custom claims:`, JSON.stringify(user.customClaims, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

const command = process.argv[2];
const arg1 = process.argv[3];

if (command === 'check' && arg1) {
  console.log(`Checking: ${arg1}`);
  checkUser(arg1);
} else if (command === 'set-admin' && arg1) {
  console.log(`Setting admin for: ${arg1}`);
  setGlobalAdmin(arg1);
} else {
  console.log('Usage: node scripts/admin-user.js <command> <email>');
  console.log('  check     - Check user claims');
  console.log('  set-admin - Set user as admin');
}