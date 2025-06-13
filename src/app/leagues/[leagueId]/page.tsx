import LeagueDetailsClient from "./LeagueDetailsClient";
<<<<<<< HEAD
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LeagueDetailsPage({ params }: { params: any }) {
  const leagueId = decodeURIComponent(params.leagueId as string);
=======
import { useParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LeagueDetailsPage({ params }: { params: { leagueId: string } }) {
  const leagueId = decodeURIComponent(params.leagueId);
>>>>>>> 6e5b227c19f69feb43ebe009347863fd398c2203
  return <LeagueDetailsClient leagueId={leagueId} />;
}

// Add back generateStaticParams for static export
export async function generateStaticParams() {
  // This fetches all league IDs for static generation and encodes them for URL use
  const sports = ['football', 'cricket', 'basketball', 'hockey'];
  const allLeagueIds = [];
  
  for (const sport of sports) {
    const leaguesCol = collection(db, "leagues", sport, "leagues");
    const snapshot = await getDocs(leaguesCol);
    allLeagueIds.push(...snapshot.docs.map(doc => ({ leagueId: encodeURIComponent(doc.id) })));
  }
  
  return allLeagueIds;
} 