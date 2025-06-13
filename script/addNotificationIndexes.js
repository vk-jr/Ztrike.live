const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function createNotificationIndexes() {
  try {
    const db = admin.firestore();
    
    // Create composite index for notifications query
    await db.collection('notifications').listIndexes();

    // Create required indexes    // Create notification indexes
    await admin.firestore().collection('notifications').doc('--indexes--').set({
      composite: [
        {
          fields: [
            { fieldPath: 'userId', order: 'ASCENDING' },
            { fieldPath: 'createdAt', order: 'DESCENDING' }
          ],
          queryScope: 'COLLECTION'
        },
        {
          fields: [
            { fieldPath: 'userId', order: 'ASCENDING' },
            { fieldPath: 'read', order: 'ASCENDING' },
            { fieldPath: 'createdAt', order: 'DESCENDING' }
          ],
          queryScope: 'COLLECTION'
        }
      ]
    });

    // Create user search indexes
    await admin.firestore().collection('users').doc('--indexes--').set({
      composite: [
        {
          fields: [
            { fieldPath: 'displayName', order: 'ASCENDING' }
          ],
          queryScope: 'COLLECTION'
        }
      ]
    });

    console.log('Successfully created indexes for notifications collection');
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    process.exit(0);
  }
}

createNotificationIndexes();
