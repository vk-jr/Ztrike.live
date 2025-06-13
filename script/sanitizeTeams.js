const admin = require("firebase-admin");
const fs = require("fs");

// TODO: Replace with the path to your service account key
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const leaguePath = "leagues/football/leagues/Muttathara Premier League/teams";

async function sanitizeId(id) {
  // Replace spaces and special characters with underscores
  return encodeURIComponent(id).replace(/%20/g, "_");
}

async function main() {
  const teamsRef = db.collection(leaguePath);
  const teamsSnap = await teamsRef.get();

  for (const teamDoc of teamsSnap.docs) {
    const teamData = teamDoc.data();
    const safeTeamId = await sanitizeId(teamDoc.id);

    // If the ID is already safe, skip
    if (safeTeamId === teamDoc.id) continue;

    // Copy team data to new doc with safe ID
    const newTeamRef = db.collection(leaguePath).doc(safeTeamId);
    await newTeamRef.set(teamData);

    // Copy players subcollection
    const playersRef = teamDoc.ref.collection("players");
    const playersSnap = await playersRef.get();
    for (const playerDoc of playersSnap.docs) {
      const playerData = playerDoc.data();
      const safePlayerId = await sanitizeId(playerDoc.id);
      await newTeamRef.collection("players").doc(safePlayerId).set(playerData);
    }

    // Optionally, delete the old team doc (uncomment if you want to remove originals)
    // await teamDoc.ref.delete();

    console.log(`Team "${teamDoc.id}" copied to "${safeTeamId}" with players.`);
  }

  console.log("Sanitization complete!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});