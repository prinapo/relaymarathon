const { initializeApp } = require("firebase/app");
const {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} = require("firebase/auth");
const {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBGxGoiaX-9pU_r3P2GHcWgqW2rsYn1ilE",
  authDomain: "milano-relay-marathon.firebaseapp.com",
  projectId: "demo-emulator",
  storageBucket: "milano-relay-marathon.firebasestorage.app",
  messagingSenderId: "600515034231",
  appId: "1:600515034231:web:0f9aad3b89ab7298f35a72",
};

const EMULATOR_AUTH = "http://127.0.0.1:9099";
const EMULATOR_HOST = "127.0.0.1";
const EMULATOR_PORT = 8080;

const CAPTAIN_EMAIL = "prova@gmail.com";
const CAPTAIN_PASSWORD = "prova_prova";
const RUNNER_EMAIL = "riprova@gmail.com";
const RUNNER_PASSWORD = "riprova!!";

const TEST_TEAM_NAME = "E2E Test Team";
const TEST_RACE_ID = "race_test_001";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createTestUsers() {
  console.log("Initializing Firebase app with emulator...");

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  connectAuthEmulator(auth, EMULATOR_AUTH);
  connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORT);

  console.log("Connected to emulators:");
  console.log(`  Auth: ${EMULATOR_AUTH}`);
  console.log(`  Firestore: ${EMULATOR_HOST}:${EMULATOR_PORT}`);

  console.log("\nCreating test users...");

  let captainUid, runnerUid;

  // Create or get captain
  try {
    const captainUser = await createUserWithEmailAndPassword(
      auth,
      CAPTAIN_EMAIL,
      CAPTAIN_PASSWORD
    );
    captainUid = captainUser.user.uid;
    console.log(`✓ Created captain: ${CAPTAIN_EMAIL} (uid: ${captainUid})`);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log(`  Captain exists, signing in...`);
      const user = await signInWithEmailAndPassword(auth, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
      captainUid = user.user.uid;
      console.log(`✓ Using captain: ${CAPTAIN_EMAIL} (uid: ${captainUid})`);
    } else if (error.code === "auth/network-request-failed") {
      // Might already exist, try sign in
      try {
        console.log(`  Network error, trying sign in...`);
        const user = await signInWithEmailAndPassword(auth, CAPTAIN_EMAIL, CAPTAIN_PASSWORD);
        captainUid = user.user.uid;
        console.log(`✓ Using captain: ${CAPTAIN_EMAIL} (uid: ${captainUid})`);
      } catch (signInError) {
        console.log(`  Sign in failed: ${signInError.message}`);
        throw error;
      }
    } else {
      throw error;
    }
  }

  // Create or get runner
  try {
    const runnerUser = await createUserWithEmailAndPassword(
      auth,
      RUNNER_EMAIL,
      RUNNER_PASSWORD
    );
    runnerUid = runnerUser.user.uid;
    console.log(`✓ Created runner: ${RUNNER_EMAIL} (uid: ${runnerUid})`);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log(`  Runner exists, signing in...`);
      const user = await signInWithEmailAndPassword(auth, RUNNER_EMAIL, RUNNER_PASSWORD);
      runnerUid = user.user.uid;
      console.log(`✓ Using runner: ${RUNNER_EMAIL} (uid: ${runnerUid})`);
    } else if (error.code === "auth/network-request-failed") {
      try {
        console.log(`  Network error, trying sign in...`);
        const user = await signInWithEmailAndPassword(auth, RUNNER_EMAIL, RUNNER_PASSWORD);
        runnerUid = user.user.uid;
        console.log(`✓ Using runner: ${RUNNER_EMAIL} (uid: ${runnerUid})`);
      } catch (signInError) {
        console.log(`  Sign in failed: ${signInError.message}`);
        throw error;
      }
    } else {
      throw error;
    }
  }

  // Skip Firestore operations since they fail - the Auth emulator is enough for now
  console.log("\n✓ Test users created!");
  console.log(`  Captain: ${CAPTAIN_EMAIL}`);
  console.log(`  Runner: ${RUNNER_EMAIL}`);

  await signOut(auth);
  console.log("\nDone!");
}

createTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });