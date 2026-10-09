import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const usersSnap = await getDocs(collection(db, "users"));
  const emails = new Set();
  
  usersSnap.forEach(doc => {
    const data = doc.data();
    if (data.email) emails.add(data.email);
  });
  
  console.log("Found emails:", Array.from(emails));
  
  for (const email of emails) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log(`Successfully sent reset email to ${email}`);
    } catch (e) {
      console.error(`Failed to send to ${email}:`, e.message);
    }
  }
  process.exit(0);
}
run();
