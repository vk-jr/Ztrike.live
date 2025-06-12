const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createMessageIndexes() {
  try {
    const db = admin.firestore();
    
    // Create composite index for messages collection
    await db.collection('messages').listIndexes().then(async (indexes) => {
      // Check if our required index already exists
      const requiredIndex = indexes.find(index => 
        index.fields.length === 2 &&
        index.fields[0].fieldPath === 'participantIds' &&
        index.fields[0].arrayConfig === 'CONTAINS' &&
        index.fields[1].fieldPath === 'createdAt' &&
        index.fields[1].order === 'DESCENDING'
      );

      if (!requiredIndex) {
        console.log('Creating required index for messages collection...');
        
        // Create the index
        const indexFields = [{
          fieldPath: 'participantIds',
          arrayConfig: 'CONTAINS'
        }, {
          fieldPath: 'createdAt',
          order: 'DESCENDING'
        }];

        await db.collection('messages').createIndex(indexFields);
        console.log('Index created successfully!');
      } else {
        console.log('Required index already exists.');
      }
    });

  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    // Clean up: Terminate the admin app
    await admin.app().delete();
  }
}

// Run the script
createMessageIndexes().then(() => {
  console.log('Script completed');
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
