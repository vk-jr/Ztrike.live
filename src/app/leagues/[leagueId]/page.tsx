"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import React from "react";

export default function LeagueDetailsPage() {
  const params = useParams();
  const leagueId = decodeURIComponent(params.leagueId as string);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchTeams = async () => {
      try {
        const teamsCol = collection(db, "leagues", "football", leagueId);
        const snapshot = await getDocs(teamsCol);
        const teamList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeams(teamList);
      } catch (err: any) {
        setError(err.message || "Failed to fetch teams");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [leagueId]);

  const handleTeamClick = async (teamId: string) => {
    setSelectedTeam(teamId);
    setLoading(true);
    setError(null);
    try {
      const playersCol = collection(db, "leagues", "football", leagueId, teamId, "players");
      const snapshot = await getDocs(playersCol);
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      setError(err.message || "Failed to fetch players");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{leagueId} - League Table</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8 text-blue-600 font-semibold">Loading...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600 flex flex-col items-center">
              <AlertCircle className="w-8 h-8 mb-2" />
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">Team</th>
                    <th className="px-4 py-2">Points</th>
                    <th className="px-4 py-2">Position</th>
                    <th className="px-4 py-2">Matches</th>
                    <th className="px-4 py-2">Wins</th>
                    <th className="px-4 py-2">Draw</th>
                    <th className="px-4 py-2">Losses</th>
                    <th className="px-4 py-2">View Players</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(team => (
                    <React.Fragment key={team.id}>
                      <tr className="border-b hover:bg-blue-50">
                        <td className="px-4 py-2 font-semibold">{team.name}</td>
                        <td className="px-4 py-2">{team.points}</td>
                        <td className="px-4 py-2">{team.position}</td>
                        <td className="px-4 py-2">{team.matches_played}</td>
                        <td className="px-4 py-2">{team.wins}</td>
                        <td className="px-4 py-2">{team.draw}</td>
                        <td className="px-4 py-2">{team.losses}</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline" onClick={() => handleTeamClick(team.id)}>
                            Players
                          </Button>
                        </td>
                      </tr>
                      <tr className="bg-gray-50 text-xs">
                        <td colSpan={8} className="px-4 py-1">
                          {/* Show all extra fields for the team */}
                          {Object.entries(team)
                            .filter(([key]) => !["id", "name", "points", "position", "matches_played", "wins", "draw", "losses"].includes(key))
                            .map(([key, value]) => (
                              <span key={key} className="mr-4"><b>{key}:</b> {String(value)}</span>
                            ))}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTeam && !loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Players - {selectedTeam}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2">Player</th>
                    <th className="px-4 py-2">Position</th>
                    <th className="px-4 py-2">Goals</th>
                    <th className="px-4 py-2">MVPs</th>
                    <th className="px-4 py-2">Saves</th>
                    <th className="px-4 py-2">Assist</th>
                    <th className="px-4 py-2">Matches</th>
                    {/* Show all extra fields */}
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => {
                    const tds = [
                      <td key="name" className="px-4 py-2 font-semibold">{player.name || player.id}</td>,
                      <td key="position" className="px-4 py-2">{player.position || "-"}</td>,
                      <td key="Goals" className="px-4 py-2">{player.Goals ?? "-"}</td>,
                      <td key="MVPs" className="px-4 py-2">{player.MVPs ?? "-"}</td>,
                      <td key="Saves" className="px-4 py-2">{player.Saves ?? "-"}</td>,
                      <td key="assist" className="px-4 py-2">{player.assist ?? "-"}</td>,
                      <td key="matches_played" className="px-4 py-2">{player.matches_played ?? "-"}</td>,
                      ...Object.entries(player)
                        .filter(([key]) => !["id", "name", "position", "Goals", "MVPs", "Saves", "assist", "matches_played", "player_id"].includes(key))
                        .map(([key, value]) => (
                          <td key={key} className="px-2 py-2 text-xs"><b>{key}:</b> {String(value)}</td>
                        ))
                    ];
                    return (
                      <tr key={player.id} className="border-b">
                        {tds}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const leaguesCol = collection(db, "leagues");
  const snapshot = await getDocs(leaguesCol);
  return snapshot.docs.map(doc => ({ leagueId: doc.id }));
} 