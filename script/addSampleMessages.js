const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createSampleMessage(senderId, receiverId, content) {
  try {
    const messageRef = db.collection('messages').doc();
    const now = admin.firestore.Timestamp.now();

    await messageRef.set({
      senderId,
      receiverId,
      content,
      participantIds: [senderId, receiverId],
      read: false,
      createdAt: now,
      updatedAt: now
    });

    console.log(`Created message: ${messageRef.id}`);
    return messageRef.id;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

async function addSampleMessages() {
  try {
    // First get a list of users to create messages between
    const usersSnapshot = await db.collection('users').limit(5).get();
    const users = usersSnapshot.docs.map(doc => doc.id);

    if (users.length < 2) {
      console.log('Not enough users in the database to create sample messages');
      return;
    }

    // Create some sample messages between the first two users
    const user1 = users[0];
    const user2 = users[1];

    const sampleMessages = [
      {
        senderId: user1,
        receiverId: user2,
        content: "Hey! How are you?"
      },
      {
        senderId: user2,
        receiverId: user1,
        content: "I'm good, thanks! How about you?"
      },
      {
        senderId: user1,
        receiverId: user2,
        content: "Great! Would you like to join my team for the upcoming tournament?"
      }
    ];

    // Create messages sequentially with small delays
    for (const message of sampleMessages) {
      await createSampleMessage(message.senderId, message.receiverId, message.content);
      // Add a small delay between messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Sample messages created successfully!');

  } catch (error) {
    console.error('Error adding sample messages:', error);
  } finally {
    // Clean up: Terminate the admin app
    await admin.app().delete();
  }
}

// Run the script
addSampleMessages().then(() => {
  console.log('Script completed');
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
