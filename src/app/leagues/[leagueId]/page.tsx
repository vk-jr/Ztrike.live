import LeagueDetailsClient from "./LeagueDetailsClient";
import { useParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LeagueDetailsPage({ params }: { params: { leagueId: string } }) {
  const leagueId = decodeURIComponent(params.leagueId);
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