import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const auth = getAuth(app);

async function run() {
  const email = "rabsongalambi@gmail.com";
  try {
    await sendPasswordResetEmail(auth, email);
    console.log(`Successfully sent reset email to ${email}`);
  } catch (e) {
    console.error(`Failed to send to ${email}:`, e.message);
  }
  process.exit(0);
}
run();
