import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("Checking categories...");
  try {
    const catsRef = collection(db, 'serviceCategories');
    const snap = await getDocs(catsRef);
    console.log("Categories count:", snap.size);
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
check();
