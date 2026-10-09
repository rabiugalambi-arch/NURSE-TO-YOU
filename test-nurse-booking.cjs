const { initializeApp } = require('firebase/app');
const { getFirestore, runTransaction, doc, collection, setDoc, getDoc, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  try {
    const creds = JSON.parse(fs.readFileSync('test-credentials.json', 'utf8'));
    await signInWithEmailAndPassword(auth, creds.email, creds.password);
    console.log("Logged in");

    // find a provider
    const pSnap = await getDocs(collection(db, 'providers'));
    let pId = null;
    pSnap.forEach(d => pId = pId || d.id);
    
    if (!pId) throw new Error("No provider found");

    await runTransaction(db, async (t) => {
      const pRef = doc(db, 'providers', pId);
      t.update(pRef, { isBusy: true, currentBookingId: 'test-booking' });
    });
    console.log("Transaction success");
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
