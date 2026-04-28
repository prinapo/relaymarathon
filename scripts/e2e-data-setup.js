/**
 * E2E Test Data Setup
 * Creates and cleans up test data for Playwright E2E tests
 * 
 * Supports both Firebase Emulator and Production Firestore
 * 
 * Usage:
 *   node scripts/e2e-data-setup.js --setup    Create test data
 *   node scripts/e2e-data-setup.js --cleanup Clean up test data
 *   node scripts/e2e-data-setup.js --status  Show status
 *   node scripts/e2e-data-setup.js --emulator Use emulator mode
 */

const http = require('http');
const https = require('https');

const TEST_PREFIX = 'e2e_';
const PROJECT_ID = 'relaymarathon-2025';

const TEST_RACE = {
  name: `${TEST_PREFIX}Gara Test Milano 2026`,
  location: 'Milano, Italia',
  date: '2026-06-15',
  startTime: '08:00',
  defaultStartDelay: 300,
  isDefault: false,
  segments: [
    { id: 'seg1', name: 'Tratta 1 - Centro', type: 'solo', distance: 5 },
    { id: 'seg2', name: 'Tratta 2 - Nord', type: 'solo', distance: 5 },
    { id: 'seg3', name: 'Tratta 3 - Est', type: 'solo', distance: 5 },
    { id: 'seg4', name: 'Tratta 4 - Gruppo', type: 'group', distance: 10 },
  ],
  routeEmbedCode: '',
  adminUids: []
};

const TEST_APPOINTMENT = {
  title: `${TEST_PREFIX}Appuntamento Test`,
  description: 'Appuntamento per test E2E',
  date: '2026-06-14',
  time: '18:00',
  location: 'Milano',
  type: 'briefing'
};

const TEST_FAQ = {
  question: `${TEST_PREFIX}Domanda Test FAQ`,
  answer: 'Risposta test per E2E',
  category: 'test',
  isHidden: false
};

const TEST_HELP = {
  title: `${TEST_PREFIX}Sezione Help Test`,
  content: 'Contenuto test per E2E',
  category: 'test',
  isHidden: false
};

function isEmulator() {
  return process.env.FIRESTORE_EMULATOR_HOST || process.argv.includes('--emulator');
}

function firestoreRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const emulator = isEmulator();
    const host = emulator ? 'localhost:8080' : 'firestore.googleapis.com';
    const port = emulator ? 8080 : 443;
    const basePath = emulator ? '' : `/v1/projects/${PROJECT_ID}`;
    const protocol = emulator ? http : https;

    const options = {
      hostname: host,
      port: port,
      path: `${basePath}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(emulator ? {} : { 
          'Authorization': `Bearer ${process.env.FIREBASE_TOKEN || ''}` 
        })
      }
    };

    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function listDocuments(collection) {
  try {
    const result = await firestoreRequest('GET', `/databases/(default)/documents/${collection}`);
    if (result.status === 200 && result.data.documents) {
      return result.data.documents.map(doc => {
        const fields = {};
        for (const [key, value] of Object.entries(doc.fields || {})) {
          fields[key] = value.stringValue || value.integerValue || value.booleanValue || value.arrayValue || value.mapValue || null;
        }
        return { id: doc.name.split('/').pop(), ...fields };
      });
    }
  } catch (e) {
    console.log(`  Warning: Could not list ${collection}: ${e.message}`);
  }
  return [];
}

async function createDocument(collection, data) {
  const result = await firestoreRequest('POST', `/databases/(default)/documents/${collection}`, data);
  if (result.status === 200 || result.status === 201) {
    return result.data.name?.split('/').pop();
  }
  console.log(`  Warning: Failed to create in ${collection}: ${result.status}`);
  return null;
}

async function deleteDocument(collection, docId) {
  try {
    await firestoreRequest('DELETE', `/databases/(default)/documents/${collection}/${docId}`);
  } catch (e) {
    console.log(`  Warning: Could not delete ${collection}/${docId}: ${e.message}`);
  }
}

function toFirestoreValue(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { integerValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(v => toFirestoreValue(v)) } };
  if (typeof value === 'object' && value !== null) {
    return { mapValue: { fields: Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, toFirestoreValue(v)])
    )}};
  }
  return { stringValue: String(value) };
}

async function createTestRace() {
  const raceId = await createDocument('races', {
    name: toFirestoreValue(TEST_RACE.name),
    location: toFirestoreValue(TEST_RACE.location),
    date: toFirestoreValue(TEST_RACE.date),
    startTime: toFirestoreValue(TEST_RACE.startTime),
    defaultStartDelay: toFirestoreValue(TEST_RACE.defaultStartDelay),
    isDefault: toFirestoreValue(TEST_RACE.isDefault),
    segments: toFirestoreValue(TEST_RACE.segments),
    routeEmbedCode: toFirestoreValue(TEST_RACE.routeEmbedCode),
    adminUids: toFirestoreValue(TEST_RACE.adminUids)
  });
  if (raceId) console.log(`  Created race: ${raceId}`);
  return raceId;
}

async function createTestAppointment(raceId) {
  const id = await createDocument('appointments', {
    title: toFirestoreValue(TEST_APPOINTMENT.title),
    description: toFirestoreValue(TEST_APPOINTMENT.description),
    date: toFirestoreValue(TEST_APPOINTMENT.date),
    time: toFirestoreValue(TEST_APPOINTMENT.time),
    location: toFirestoreValue(TEST_APPOINTMENT.location),
    type: toFirestoreValue(TEST_APPOINTMENT.type),
    raceId: toFirestoreValue(raceId || 'all')
  });
  if (id) console.log(`  Created appointment: ${id}`);
  return id;
}

async function createTestFAQ(raceId) {
  const id = await createDocument('faq', {
    question: toFirestoreValue(TEST_FAQ.question),
    answer: toFirestoreValue(TEST_FAQ.answer),
    category: toFirestoreValue(TEST_FAQ.category),
    isHidden: toFirestoreValue(TEST_FAQ.isHidden),
    raceId: toFirestoreValue(raceId || 'all')
  });
  if (id) console.log(`  Created FAQ: ${id}`);
  return id;
}

async function createTestHelp(raceId) {
  const id = await createDocument('help', {
    title: toFirestoreValue(TEST_HELP.title),
    content: toFirestoreValue(TEST_HELP.content),
    category: toFirestoreValue(TEST_HELP.category),
    isHidden: toFirestoreValue(TEST_HELP.isHidden),
    raceId: toFirestoreValue(raceId || 'all')
  });
  if (id) console.log(`  Created help: ${id}`);
  return id;
}

async function cleanupTestData() {
  const collections = ['races', 'appointments', 'faq', 'help', 'teams'];
  let totalDeleted = 0;

  console.log('\nCleaning up test data...\n');

  for (const collName of collections) {
    const docs = await listDocuments(collName);
    let deleted = 0;

    for (const doc of docs) {
      const name = doc.name || doc.title || doc.question || '';
      
      if (name.startsWith(TEST_PREFIX)) {
        await deleteDocument(collName, doc.id);
        deleted++;
        totalDeleted++;
      }
    }

    console.log(`  Deleted ${deleted} from ${collName}`);
  }

  return totalDeleted;
}

async function showStatus() {
  const collections = ['races', 'appointments', 'faq', 'help', 'teams'];
  
  console.log('\n=== Test Data Status ===\n');

  for (const collName of collections) {
    const docs = await listDocuments(collName);
    const testDocs = docs.filter(doc => {
      const name = doc.name || doc.title || doc.question || '';
      return name.startsWith(TEST_PREFIX);
    });
    console.log(`${collName}: ${testDocs.length} test documents`);
  }
  console.log('');
}

function showHelp() {
  console.log(`
E2E Test Data Setup Script

Usage:
  node scripts/e2e-data-setup.js --setup    Create test data for E2E tests
  node scripts/e2e-data-setup.js --cleanup Clean up test data
  node scripts/e2e-data-setup.js --status  Show status of test data
  node scripts/e2e-data-setup.js --emulator Use Firestore emulator

Environment Variables:
  FIRESTORE_EMULATOR_HOST  Use emulator (e.g., localhost:8080)
  FIREBASE_TOKEN          Auth token for production Firestore

Examples:
  # Create test data (production)
  node scripts/e2e-data-setup.js --setup

  # Create test data (emulator)
  FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/e2e-data-setup.js --setup

  # Clean up test data
  node scripts/e2e-data-setup.js --cleanup
`);
}

async function main() {
  const args = process.argv.slice(2);
  const emulator = isEmulator();

  console.log('\n========================================');
  console.log('   E2E Test Data Setup');
  console.log('========================================');
  console.log(`Mode: ${emulator ? 'Firebase Emulator' : 'Production'}`);
  console.log(`Prefix: ${TEST_PREFIX}`);
  console.log('========================================\n');

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--status')) {
    await showStatus();
    return;
  }

  if (args.includes('--cleanup')) {
    console.log('=== Cleanup ===\n');
    const deleted = await cleanupTestData();
    console.log(`\n✓ Cleaned up ${deleted} test documents\n`);
    return;
  }

  if (args.includes('--setup')) {
    console.log('=== Setup Test Data ===\n');
    
    try {
      const raceId = await createTestRace();
      await createTestAppointment(raceId);
      await createTestFAQ(raceId);
      await createTestHelp(raceId);
      
      console.log(`\n✓ Test data created successfully!`);
      console.log(`  All data is prefixed with "${TEST_PREFIX}" for easy cleanup`);
      console.log(`  Run --cleanup when done testing\n`);
    } catch (err) {
      console.error('\n✗ Failed to create test data:', err.message);
      console.log('\nMake sure you have:');
      console.log('  - Firebase CLI installed (npm install -g firebase-tools)');
      console.log('  - Authentication configured');
      console.log('  - Or use emulator: FIRESTORE_EMULATOR_HOST=localhost:8080\n');
    }
    return;
  }

  showHelp();
}

main().catch(console.error);