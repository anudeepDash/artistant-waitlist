const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

async function main() {
  console.log("Checking Firebase Auth users...");
  try {
    const listUsersResult = await getAuth().listUsers(100);
    console.log(`Found ${listUsersResult.users.length} users in Auth.`);
    if (listUsersResult.users.length > 0) {
      console.log("Sample user:", listUsersResult.users[0].toJSON());
    }
  } catch (err) {
    console.error("Error fetching Auth users:", err.message);
  }

  console.log("\nChecking Firestore collections...");
  try {
    const db = getFirestore();
    const collections = await db.listCollections();
    console.log(`Found ${collections.length} collections.`);
    for (const col of collections) {
      console.log(`- Collection: ${col.id}`);
      const snapshot = await col.limit(1).get();
      if (!snapshot.empty) {
        console.log(`  Sample document from ${col.id}:`, snapshot.docs[0].data());
      } else {
        console.log(`  Collection ${col.id} is empty.`);
      }
      
      const countSnap = await col.count().get();
      console.log(`  Total documents in ${col.id}: ${countSnap.data().count}`);
    }
  } catch (err) {
    console.error("Error fetching Firestore collections:", err.message);
  }
}

main().catch(console.error);
