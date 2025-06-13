const admin = require("firebase-admin");

// Update with your service account key file path
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const leaguePath = "leagues/football/leagues/Muttathara Premier League";

function safeId(id) {
  // Lowercase, replace spaces with underscores, remove special chars except underscores
  return id.toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "");
}

async function moveTeamsAndPlayersToLowercaseAndSafeIds() {
  const oldTeamsRef = db.collection(`${leaguePath}/Teams`);
  const newTeamsRef = db.collection(`${leaguePath}/teams`);

  const teamsSnap = await oldTeamsRef.get();

  for (const teamDoc of teamsSnap.docs) {
    const teamData = teamDoc.data();
    const safeTeamId = safeId(teamDoc.id);

    // Copy team document to new 'teams' subcollection with safe ID
    await newTeamsRef.doc(safeTeamId).set(teamData);

    // Copy players subcollection
    const playersSnap = await teamDoc.ref.collection("players").get();
    for (const playerDoc of playersSnap.docs) {
      const playerData = playerDoc.data();
      const safePlayerId = safeId(playerDoc.id);
      await newTeamsRef
        .doc(safeTeamId)
        .collection("players")
        .doc(safePlayerId)
        .set(playerData);

      console.log(
        `Moved player "${playerDoc.id}" to "${safePlayerId}" under team "${safeTeamId}".`
      );
    }

    console.log(`Moved team "${teamDoc.id}" to "${safeTeamId}" and its players.`);
  }

  console.log("All teams and players moved and sanitized!");
  process.exit(0);
}

moveTeamsAndPlayersToLowercaseAndSafeIds().catch((err) => {
  console.error(err);
  process.exit(1);
});