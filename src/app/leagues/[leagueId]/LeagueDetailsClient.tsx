"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import React from "react";

// Sport-specific stat configuration
const SPORT_STATS = {
  football: {
    mainStat: { key: 'Goals', label: 'Goals', color: 'text-green-600' },
    secondaryStat: { key: 'assist', label: 'Assists', color: 'text-blue-600' },
    additionalStats: [
      { key: 'clean_sheets', label: 'Clean Sheets', color: 'text-green-700', bgColor: 'bg-green-50' },
      { key: 'Saves', label: 'Saves', color: 'text-blue-700', bgColor: 'bg-blue-50' }
    ]
  },
  cricket: {
    mainStat: { key: 'runs', label: 'Runs', color: 'text-green-600' },
    secondaryStat: { key: 'wickets', label: 'Wickets', color: 'text-blue-600' },
    additionalStats: [
      { key: 'centuries', label: 'Centuries', color: 'text-purple-700', bgColor: 'bg-purple-50' },
      { key: 'strike_rate', label: 'Strike Rate', color: 'text-orange-700', bgColor: 'bg-orange-50' }
    ]
  },
  basketball: {
    mainStat: { key: 'points', label: 'Points', color: 'text-green-600' },
    secondaryStat: { key: 'assists', label: 'Assists', color: 'text-blue-600' },
    additionalStats: [
      { key: 'rebounds', label: 'Rebounds', color: 'text-purple-700', bgColor: 'bg-purple-50' },
      { key: 'steals', label: 'Steals', color: 'text-orange-700', bgColor: 'bg-orange-50' }
    ]
  },
  hockey: {
    mainStat: { key: 'goals', label: 'Goals', color: 'text-green-600' },
    secondaryStat: { key: 'assists', label: 'Assists', color: 'text-blue-600' },
    additionalStats: [
      { key: 'saves', label: 'Saves', color: 'text-blue-700', bgColor: 'bg-blue-50' },
      { key: 'penalties', label: 'Penalties', color: 'text-red-700', bgColor: 'bg-red-50' }
    ]
  }
} as const;

interface Team {
  id: string;
  name: string;
  matches_played: number;
  wins: number;
  draw: number;
  losses: number;
  points: number;
  // Common sport-specific stats (add more as needed based on your data)
  goals_for?: number;
  goals_against?: number;
  goal_difference?: number;
  net_run_rate?: number;
  points_for?: number;
  points_against?: number;
  point_difference?: number;
  [key: string]: any; // Keep index signature for flexibility
}

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number?: string;
  matches_played?: number;
  MVPs?: number;
  [key: string]: any;
}

export default function LeagueDetailsClient({ leagueId }: { leagueId: string }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leagueInfo, setLeagueInfo] = useState<{ id: string; sport: string; name?: string; season?: string; country?: string; description?: string; } | null>(null);

  const getSportIcon = (sport: string) => {
    switch(sport) {
      case 'football': return '⚽';
      case 'cricket': return '🏏';
      case 'basketball': return '🏀';
      case 'hockey': return '🏑';
      default: return '🎮';
    }
  };

  useEffect(() => {
    const fetchLeagueDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to find the league in each sport's collection
        const sports = ['football', 'cricket', 'basketball', 'hockey'];
        let leagueDoc = null;
        let currentSport = '';
        
        for (const s of sports) {
          const docRef = doc(db, "leagues", s, "leagues", leagueId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            leagueDoc = docSnap;
            currentSport = s;
            break;
          }
        }

        if (!leagueDoc) {
          throw new Error('League not found');
        }

        // Set league info
        setLeagueInfo({
          id: leagueDoc.id,
          ...leagueDoc.data(),
          sport: currentSport
        } as any);

        // Fetch teams
        const teamsCollection = collection(db, "leagues", currentSport, "leagues", leagueId, "teams");
        const teamsSnapshot = await getDocs(teamsCollection);
        const teamsList = teamsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Ensure default values for required fields
          matches_played: doc.data().matches_played || 0,
          wins: doc.data().wins || 0,
          draw: doc.data().draw || 0,
          losses: doc.data().losses || 0,
          points: doc.data().points || 0,
          // Include sport-specific stats
          goals_for: doc.data().goals_for, // Include football/hockey stat
          goals_against: doc.data().goals_against, // Include football/hockey stat
          goal_difference: doc.data().goal_difference, // Include football/hockey stat
          net_run_rate: doc.data().net_run_rate, // Include cricket stat
          points_for: doc.data().points_for, // Include basketball stat
          points_against: doc.data().points_against, // Include basketball stat
          point_difference: doc.data().point_difference, // Include basketball stat
        })) as Team[];

        // Sort teams
        if (currentSport === 'cricket') {
          setTeams(teamsList.sort((a, b) => {
            if (b.points !== a.points) {
              return b.points - a.points; // Sort by points first (descending)
            } else {
              return (b.NRR ?? 0) - (a.NRR ?? 0); // Then sort by NRR (descending)
            }
          }));
        } else {
          setTeams(teamsList.sort((a, b) => b.points - a.points)); // Sort by points for other sports
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch league details");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueDetails();
  }, [leagueId]);

  const handleTeamClick = async (teamId: string) => {
    setSelectedTeam(teamId);
    setLoading(true);
    setError(null);
    
    try {
      const sport = leagueInfo?.sport || 'football';
      const playersCollection = collection(db, "leagues", sport, "leagues", leagueId, "teams", teamId, "players");
      const playersSnapshot = await getDocs(playersCollection);
      setPlayers(playersSnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data()
      })) as Player[]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch players");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* League Header */}
      {leagueInfo && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
              {getSportIcon(leagueInfo.sport)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{leagueInfo.name || leagueId}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <span className="capitalize">{leagueInfo.sport}</span>
                {leagueInfo.season && <span>• Season {leagueInfo.season}</span>}
                {leagueInfo.country && <span>• {leagueInfo.country}</span>}
              </div>
            </div>
          </div>
          {leagueInfo.description && (
            <p className="text-gray-600">{leagueInfo.description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                League Table
                {loading && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="text-center py-8 text-blue-600 font-semibold">Loading league data...</div>
              )}
              {error && (
                <div className="text-center py-8 text-red-600 flex flex-col items-center">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  {error}
                </div>
              )}
              {!loading && !error && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600">
                        <th className="px-4 py-3 text-left font-medium">Position</th>
                        <th className="px-4 py-3 text-left font-medium">Team</th>
                        <th className="px-4 py-3 text-center font-medium">P</th>
                        <th className="px-4 py-3 text-center font-medium">M</th>
                        <th className="px-4 py-3 text-center font-medium">W</th>
                        <th className="px-4 py-3 text-center font-medium">L</th>
                        {/* Sport-specific columns */}
                        {leagueInfo?.sport === 'football' && (
                          <>
                          <th className="px-4 py-3 text-center font-medium">D</th>
                            <th className="px-4 py-3 text-center font-medium">GF</th>
                            <th className="px-4 py-3 text-center font-medium">GA</th>
                            <th className="px-4 py-3 text-center font-medium">GD</th>
                          </>
                        )}
                        {leagueInfo?.sport === 'cricket' && (
                          <th className="px-4 py-3 text-center font-medium">NRR</th>
                        )}
                        {leagueInfo?.sport === 'basketball' && (
                          <>
                            <th className="px-4 py-3 text-center font-medium">PF</th>
                            <th className="px-4 py-3 text-center font-medium">PA</th>
                            <th className="px-4 py-3 text-center font-medium">PD</th>
                          </>
                        )}
                         {leagueInfo?.sport === 'hockey' && (
                          <>
                          <th className="px-4 py-3 text-center font-medium">D</th>
                            <th className="px-4 py-3 text-center font-medium">GF</th>
                            <th className="px-4 py-3 text-center font-medium">GA</th>
                            <th className="px-4 py-3 text-center font-medium">GD</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team, index) => (
                        <tr key={team.id} className="border-t hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-left">{index + 1}</td>
                          <td className="px-4 py-3 text-left font-medium">{team.name}</td>
                          <td className="px-4 py-3 text-center font-semibold text-blue-600">{team.points}</td>
                          <td className="px-4 py-3 text-center">{team.matches}</td>
                          <td className="px-4 py-3 text-center text-green-600">{team.wins}</td>
                          <td className="px-4 py-3 text-center text-red-600">{team.losses}</td>
                          {/* Sport-specific data */}
                          {leagueInfo?.sport === 'football' && (
                            <>
                            <td className="px-4 py-3 text-center text-gray-600">{team.draw}</td>
                              <td className="px-4 py-3 text-center">{team.goals_for ?? '-'}</td> 
                              <td className="px-4 py-3 text-center">{team.goals_against ?? '-'}</td>
                              <td className="px-4 py-3 text-center">{team.goal_difference ?? '-'}</td>
                            </>
                          )}
                          {leagueInfo?.sport === 'cricket' && (
                             <td className="px-4 py-3 text-center">{team.NRR ?? '-'}</td>
                          )}
                          {leagueInfo?.sport === 'basketball' && (
                            <>
                              <td className="px-4 py-3 text-center">{team.points_for ?? '-'}</td>
                              <td className="px-4 py-3 text-center">{team.points_against ?? '-'}</td>
                              <td className="px-4 py-3 text-center">{team.point_difference ?? '-'}</td>
                            </>
                          )}
                           {leagueInfo?.sport === 'hockey' && (
                            <>
                            <td className="px-4 py-3 text-center text-gray-600">{team.draw}</td>
                              <td className="px-4 py-3 text-center">{team.goals_for ?? '-'}</td>
                              <td className="px-4 py-3 text-center">{team.goals_against ?? '-'}</td>
                              <td className="px-4 py-3 text-center">{team.goal_difference ?? '-'}</td>
                            </>
                          )}
                          {/* Add other sport-specific data cells here */}
                          <td className="px-4 py-3 text-center">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleTeamClick(team.id)}
                              className="text-xs"
                            >
                              View Squad
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Team Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>League Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
                <div className="text-sm text-gray-600">Teams</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {teams.reduce((sum, team) => sum + (team.matches_played || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Matches</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {teams.reduce((sum, team) => sum + (team.wins || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Wins</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {teams.reduce((sum, team) => sum + (team.draw || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Draws</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Squad */}
      {selectedTeam && !loading && !error && leagueInfo?.sport && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                Team Squad
                <span className="text-sm font-normal text-gray-500">
                  {teams.find(t => t.id === selectedTeam)?.name}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedTeam(null)}>
                Back to League
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="px-4 py-3 text-left font-medium">Player</th>
                    <th className="px-4 py-3 text-left font-medium">Position</th>
                    <th className="px-4 py-3 text-center font-medium">Matches</th>
                    <th className="px-4 py-3 text-center font-medium">
                      {SPORT_STATS[leagueInfo.sport as keyof typeof SPORT_STATS]?.mainStat.label || 'Goals'}
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      {SPORT_STATS[leagueInfo.sport as keyof typeof SPORT_STATS]?.secondaryStat.label || 'Assists'}
                    </th>
                    <th className="px-4 py-3 text-center font-medium">MVPs</th>
                    <th className="px-4 py-3 text-center font-medium">Stats</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => {
                    const sportStats = SPORT_STATS[leagueInfo.sport as keyof typeof SPORT_STATS];
                    return (
                      <tr key={player.id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600">
                              {(player.name || player.id).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{player.name || player.id}</div>
                              <div className="text-xs text-gray-500">#{player.jersey_number || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{player.position || "-"}</td>
                        <td className="px-4 py-3 text-center">{player.matches_played ?? "-"}</td>
                        <td className={`px-4 py-3 text-center font-medium ${sportStats?.mainStat.color}`}>
                          {player[sportStats?.mainStat.key] ?? "-"}
                        </td>
                        <td className={`px-4 py-3 text-center font-medium ${sportStats?.secondaryStat.color}`}>
                          {player[sportStats?.secondaryStat.key] ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-purple-600">{player.MVPs ?? "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2 text-xs">
                            {sportStats?.additionalStats.map(stat => 
                              player[stat.key] ? (
                                <span key={stat.key} className={`px-2 py-1 ${stat.bgColor} ${stat.color} rounded`}>
                                  {player[stat.key]} {stat.label}
                                </span>
                              ) : null
                            )}
                          </div>
                        </td>
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