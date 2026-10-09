import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, initializeFirestore } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

async function main() {
  const usersSnap = await getDocs(collection(db, "users"));
  const providersSnap = await getDocs(collection(db, "providers"));
  
  const users = [];
  usersSnap.forEach(d => users.push({id: d.id, role: d.data().role}));
  
  const providers = [];
  providersSnap.forEach(d => providers.push({id: d.id}));
  
  console.log("Users:", users);
  console.log("Providers:", providers);
  process.exit(0);
}
main();
