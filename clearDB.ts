import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import * as fs from "fs";

const configPath = './firebase-applet-config.json';
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  async function clear() {
    const qs = await getDocs(collection(db, "projects"));
    for (const d of qs.docs) {
      await deleteDoc(doc(db, "projects", d.id));
    }
    console.log("All projects deleted.");
    process.exit(0);
  }
  clear();
} else {
  console.log("No config found");
}
