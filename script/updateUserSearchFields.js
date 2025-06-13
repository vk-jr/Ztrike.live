const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateUserSearchFields() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  const batch = db.batch();
  let count = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    
    // Add displayNameLower if displayName exists
    if (data.displayName && !data.displayNameLower) {
      updates.displayNameLower = data.displayName.toLowerCase();
    }
    
    // Ensure sports array exists and values are lowercase
    if (data.sports) {
      updates.sports = data.sports.map(sport => sport.toLowerCase());
    } else {
      updates.sports = [];
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
      
      // Commit batch every 500 documents
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
  }
  
  // Commit any remaining updates
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`Updated ${count} user profiles`);
}

updateUserSearchFields().catch(console.error);
