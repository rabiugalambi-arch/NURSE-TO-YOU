const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const pSnap = await getDocs(collection(db, 'providers'));
  pSnap.forEach(doc => {
    console.log(doc.id, doc.data().name, doc.data().services);
  });
}
run();
