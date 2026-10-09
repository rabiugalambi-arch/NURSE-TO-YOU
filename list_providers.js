import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, initializeFirestore } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

async function main() {
  const snap = await getDocs(collection(db, "providers"));
  const providers = [];
  snap.forEach(doc => {
    providers.push({ id: doc.id, ...doc.data() });
  });
  console.log(JSON.stringify(providers, null, 2));
  process.exit(0);
}
main();
