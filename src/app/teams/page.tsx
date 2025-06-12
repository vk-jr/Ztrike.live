"use client";

import { Trophy, Users, Target, Calendar, Bell, Clock, MapPin, Eye, UserCheck, Search, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { PlayerCard } from "@/components/teams/PlayerCard";
import { PlayerFilters } from "@/components/teams/PlayerFilters";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from 'next/image';

// Sport-specific sorting functions
const sortFootballPlayers = (a: any, b: any) => {
  switch(a.position?.toLowerCase()) {
    case 'striker':
      if (b.Goals !== a.Goals) return b.Goals - a.Goals;
      if (b.MVPs !== a.MVPs) return b.MVPs - a.MVPs;
      if (b.matches_played !== a.matches_played) return b.matches_played - a.matches_played;
      return b.assist - a.assist;
    case 'defender':
      if (b.Saves !== a.Saves) return b.Saves - a.Saves;
      if (b.MVPs !== a.MVPs) return b.MVPs - a.MVPs;
      if (b.assist !== a.assist) return b.assist - a.assist;
      return b.matches_played - a.matches_played;
    case 'goalkeeper':
      if (b.Saves !== a.Saves) return b.Saves - a.Saves;
      if (b.MVPs !== a.MVPs) return b.MVPs - a.MVPs;
      return b.matches_played - a.matches_played;
    default:
      return 0;
  }
};

const sortCricketPlayers = (a: any, b: any) => {
  switch(a.position?.toLowerCase()) {
    case 'batsman':
      if (b.runs !== a.runs) return b.runs - a.runs;
      if (b.centuries !== a.centuries) return b.centuries - a.centuries;
      return b.strike_rate - a.strike_rate;
    case 'bowler':
      if (b.wickets !== a.wickets) return b.wickets - a.wickets;
      if (b.economy !== a.economy) return a.economy - b.economy;
      return b.matches_played - a.matches_played;
    case 'all-rounder':
      if (b.MVPs !== a.MVPs) return b.MVPs - a.MVPs;
      if (b.runs !== a.runs) return b.runs - a.runs;
      return b.wickets - a.wickets;
    default:
      return 0;
  }
};

const sortBasketballPlayers = (a: any, b: any) => {
  switch(a.position?.toLowerCase()) {
    case 'point guard':
    case 'shooting guard':
      if (b.points !== a.points) return b.points - a.points;
      if (b.assists !== a.assists) return b.assists - a.assists;
      return b.steals - a.steals;
    case 'forward':
      if (b.points !== a.points) return b.points - a.points;
      if (b.rebounds !== a.rebounds) return b.rebounds - a.rebounds;
      return b.blocks - a.blocks;
    case 'center':
      if (b.rebounds !== a.rebounds) return b.rebounds - a.rebounds;
      if (b.blocks !== a.blocks) return b.blocks - a.blocks;
      return b.points - a.points;
    default:
      return 0;
  }
};

const sortHockeyPlayers = (a: any, b: any) => {
  switch(a.position?.toLowerCase()) {
    case 'forward':
      if (b.goals !== a.goals) return b.goals - a.goals;
      if (b.assists !== a.assists) return b.assists - a.assists;
      return b.points - a.points;
    case 'defender':
      if (b.blocks !== a.blocks) return b.blocks - a.blocks;
      if (b.saves !== a.saves) return b.saves - a.saves;
      return b.penalties - a.penalties;
    case 'goalkeeper':
      if (b.saves !== a.saves) return b.saves - a.saves;
      if (b.clean_sheets !== a.clean_sheets) return b.clean_sheets - a.clean_sheets;
      return b.matches_played - a.matches_played;
    default:
      return 0;
  }
};

// Function to calculate a rank score for a player
const calculateRankScore = (player: any): number => {
  let score = 0;

  // Prioritize MVPs, Goals, and Assists as requested

  // MVPs (highest priority)
  if (player.MVPs !== undefined) {
    score += player.MVPs * 100; // High weight for MVPs
  }

  // Goals
  if (player.Goals !== undefined) {
    score += player.Goals * 50; // Moderate weight for Goals
  }

  // Assists
  if (player.assist !== undefined) {
    score += player.assist * 30; // Lower weight for Assists
  }

  // General stats, less prioritized but still contribute
  if (player.matches_played !== undefined) {
    score += player.matches_played * 1;
  }

  // Specific sports stats can also contribute, but with lower weight
  switch (player.athletic?.toLowerCase()) {
    case 'football':
      if (player.position?.toLowerCase().includes('goalkeeper')) {
        if (player.Saves !== undefined) score += player.Saves * 5;
        if (player.clean_sheets !== undefined) score += player.clean_sheets * 20;
      }
      break;
    case 'cricket':
      if (player.runs !== undefined) score += player.runs * 0.1;
      if (player.wickets !== undefined) score += player.wickets * 10;
      if (player.centuries !== undefined) score += player.centuries * 40;
      break;
    case 'basketball':
      if (player.points !== undefined) score += player.points * 0.5;
      if (player.rebounds !== undefined) score += player.rebounds * 2;
      if (player.blocks !== undefined) score += player.blocks * 3;
      if (player.steals !== undefined) score += player.steals * 4;
      break;
    case 'hockey':
        // Hockey also has Goals and Assists, already covered above with higher weights
        if (player.Saves !== undefined) score += player.Saves * 5; // For goalkeepers
        if (player.clean_sheets !== undefined) score += player.clean_sheets * 20; // For goalkeepers
      break;
  }

  // Ensure a minimum score for players to avoid negative or zero scores if no stats exist
  return Math.max(1, score);
};

// Main sort function that handles all sports
const sortPlayers = (players: any[], sport: string) => {
  let filteredPlayers = players;

  // First, filter by selected sport if not 'All'
  if (sport !== "All") {
    filteredPlayers = players.filter(player => player.athletic?.toLowerCase() === sport.toLowerCase());
  }

  // Then, sort the filtered (or all) players by rankScore in descending order
  const sortedByRank = [...filteredPlayers].sort((a, b) => {
    const rankA = a.rankScore || 0;
    const rankB = b.rankScore || 0;
    return rankB - rankA;
  });

  return sortedByRank;
};

export default function TeamsPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: 'all',
    experience: 'all',
    achievements: false
  });
  const [selectedSport, setSelectedSport] = useState("All");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleRecruit = async (playerId: string) => {
    try {
      // You can add recruitment logic here, such as:
      // - Sending a recruitment request
      // - Updating player status
      // - Creating a recruitment record
      console.log("Starting recruitment process for player:", playerId);
      
      // For now, we'll just show a message
      alert("Recruitment request sent successfully!");
    } catch (error) {
      console.error("Error recruiting player:", error);
      alert("Failed to send recruitment request. Please try again.");
    }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      if (userProfile && userProfile.userType !== 'team') {
        setLoadingTeams(true);
        let allTeams: any[] = [];
        try {
          const sportsCollection = collection(db, "leagues");
          const sportsSnapshot = await getDocs(sportsCollection);

          for (const sportDoc of sportsSnapshot.docs) {
            const leaguesCollection = collection(db, "leagues", sportDoc.id, "leagues");
            const leaguesSnapshot = await getDocs(leaguesCollection);

            for (const leagueDoc of leaguesSnapshot.docs) {
              const teamsCollection = collection(db, "leagues", sportDoc.id, "leagues", leagueDoc.id, "teams");
              const teamsSnapshot = await getDocs(teamsCollection);

              teamsSnapshot.docs.forEach(teamDoc => {
                const teamData = {
                  id: teamDoc.id,
                  ...teamDoc.data(),
                  leagueId: leagueDoc.id,
                  sportId: sportDoc.id,
                  sport: sportDoc.id,
                };
                
                if (userProfile.teams?.includes(teamDoc.id)) {
                  setMyTeams(prev => [...prev, teamData]);
                } else {
                  allTeams.push(teamData);
                }
              });
            }
          }
          setTeams(allTeams);
        } catch (error) {
          console.error("Error fetching teams:", error);
          setTeams([]);
        } finally {
          setLoadingTeams(false);
        }
      }
    };

    const fetchPlayers = async () => {
      if (userProfile?.userType === 'team') {
        setLoadingPlayers(true);
        try {
          // Query all users from the collection
          const usersRef = collection(db, "users");
          const usersQuery = query(usersRef);
          const usersSnapshot = await getDocs(usersQuery);
          
          console.log('Raw users snapshot docs:', usersSnapshot.docs.map(doc => doc.data()));

          const allUsers = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            // Trim athletic and position here at the point of data extraction
            const playerSport = (data.athletic || data.sports?.[0] || '').toLowerCase().trim();
            const playerPosition = (data.position || '').toLowerCase().trim();

            // Debugging for Rahul V K
            if (data.displayName === 'Rahul V K') {
              console.log('Debugging Rahul V K raw data after trimming:', {
                ...data,
                athletic: playerSport,
                position: playerPosition
              });
            }

            return {
              id: doc.id,
              name: data.displayName || data.firstName + ' ' + data.lastName,
              position: playerPosition, // Use the trimmed position
              athletic: playerSport, // Use the trimmed athletic
              sport: playerSport, // Also set sport for consistency, though not strictly used in filtering/card
              status: data.status || 'available',
              experience: data.experience || '',
              achievements: data.achievements || [],
              Goals: Number(data.Goals) || 0,
              assist: Number(data.assist) || 0,
              MVPs: Number(data.MVPs) || 0,
              Saves: Number(data.Saves) || 0,
              matches_played: Number(data.matches_played) || 0,
              clean_sheets: Number(data.clean_sheets) || 0,
              runs: Number(data.runs) || 0,
              wickets: Number(data.wickets) || 0,
              centuries: Number(data.centuries) || 0,
              points: Number(data.points) || 0,
              rebounds: Number(data.rebounds) || 0,
              blocks: Number(data.blocks) || 0,
              steals: Number(data.steals) || 0,
              // Calculate rank score for any user with athletic information using the trimmed data
              rankScore: playerSport ? calculateRankScore({
                ...data, // Pass original data for other fields
                athletic: playerSport, // Override with trimmed athletic
                position: playerPosition // Override with trimmed position
              }) : undefined,
            };
          });
          
          // Filter to include only documents that are likely player profiles
          const playerProfiles = allUsers.filter(user => user.athletic);

          setAvailablePlayers(playerProfiles);
        } catch (error) {
          console.error("Error fetching players:", error);
          setAvailablePlayers([]);
        } finally {
          setLoadingPlayers(false);
        }
      }
    };

    if (userProfile !== undefined) {
      if (userProfile?.userType === 'team') {
        fetchPlayers();
      } else {
        fetchTeams();
      }
    }
  }, [userProfile]);

  if (userProfile === undefined) {
    return <div>Loading user data...</div>;
  }

  if (userProfile?.userType === 'team') {
    return (
      <div className="container mx-auto p-4 space-y-6">
        {/* Recruitment Dashboard Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Recruitment Hub</h1>
              <p className="text-blue-100">Find and recruit talented players for your team</p>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => router.push('/teams/recruitment/stats')}
            >
              View Recruitment Stats
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold">{availablePlayers.length}</div>
              <div className="text-sm text-blue-100">Available Players</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-blue-100">Active Recruitments</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-blue-100">Recent Joins</div>
            </div>
          </div>
        </div>

        {/* Player Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <PlayerFilters 
              onSearch={handleSearch} 
              onFilterChange={handleFilterChange}
              onSportChange={(sport) => setSelectedSport(sport)}
              selectedSport={selectedSport}
            />
          </CardContent>
        </Card>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingPlayers ? (
            <div className="col-span-full text-center py-12">Loading available players...</div>
          ) : availablePlayers.length > 0 ? (
            sortPlayers(
              availablePlayers.filter(player => {
                // First add debug logging for rank scores
                console.log(`Player ${player.name}: athletic=${player.athletic}, position=${player.position}, rankScore=${player.rankScore}`);
            
                // Convert search query and player fields to lowercase for case-insensitive comparison
                const query = searchQuery.toLowerCase();
                const playerName = (player.name || '').toLowerCase();
                const playerPosition = (player.position || '').toLowerCase();
                const playerAthletic = (player.athletic || '').toLowerCase();
                const selectedSportLower = selectedSport.toLowerCase();

                console.log(`Filtering player ${player.name}: athletic=${playerAthletic}, selected=${selectedSportLower}, matchesSport=${selectedSport === "All" || playerAthletic === selectedSportLower}`);

                const matchesSearch = query === '' || 
                  playerName.includes(query) ||
                  playerPosition.includes(query) ||
                  playerAthletic.includes(query);

                const matchesStatus = filters.status === 'all' || player.status === filters.status;
                const matchesExperience = filters.experience === 'all' || true;
                const matchesAchievements = !filters.achievements || (player.achievements && player.achievements.length > 0);
                const matchesSport = selectedSport === "All" || playerAthletic === selectedSportLower;

                return matchesSearch && matchesStatus && matchesExperience && matchesAchievements && matchesSport;
              }), 
              selectedSport === "All" ? 'football' : selectedSport.toLowerCase() // Default to football sorting if "All" is selected
            ).map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onRecruit={handleRecruit}
                />
              ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No players found matching your criteria</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery("");
                setFilters({
                  status: 'all',
                  experience: 'all',
                  achievements: false
                });
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* My Teams Section */}
      <div className="rounded-lg overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">My Teams</h2>
          </div>
          <p className="text-blue-100 text-sm mt-1">Teams you've joined and are actively participating in</p>
        </div>
        
        <div className="p-4">
          {myTeams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myTeams.map((team) => (
                <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <CardContent className="p-0">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {team.logoUrl ? (
                          <Image 
                            src={team.logoUrl} 
                            alt={team.name} 
                            width={48} 
                            height={48}
                            className="rounded-lg"
                          />
                        ) : (
                          <Trophy className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-500">{team.sport} • {team.division || 'General'}</p>
                      </div>
                    </div>
                    <div className="border-t p-4">
                      <p className="text-sm text-gray-600">
                        Joined on {team.joinedDate || 'Recently'}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => router.push(`/teams/${team.id}`)}
                      >
                        View Details <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't joined any teams yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Available Teams Section */}
      <div className="rounded-lg overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">Available Teams</h2>
          </div>
          <p className="text-blue-100 text-sm mt-1">Teams currently accepting applications</p>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <Button
              variant={selectedSport === "All" ? "secondary" : "outline"}
              className={`rounded-full px-4 py-1 ${selectedSport === "All" ? "bg-white text-blue-600" : "bg-blue-700 text-white border-white/20"}`}
              onClick={() => setSelectedSport("All")}
            >
              All Sports
            </Button>
            {Array.from(new Set(teams.map(team => team.sport))).map((sport) => (
              <Button
                key={sport}
                variant={selectedSport === sport ? "secondary" : "outline"}
                className={`rounded-full px-4 py-1 whitespace-nowrap ${selectedSport === sport ? "bg-white text-blue-600" : "bg-blue-700 text-white border-white/20"}`}
                onClick={() => setSelectedSport(sport)}
              >
                {sport}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams
              .filter(team => selectedSport === "All" || team.sport === selectedSport)
              .map((team) => (
              <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {team.logoUrl ? (
                        <Image 
                          src={team.logoUrl} 
                          alt={team.name} 
                          width={48} 
                          height={48}
                          className="rounded-lg"
                        />
                      ) : (
                        <Trophy className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.sport} • {team.division || 'General'}</p>
                    </div>
                  </div>
                  <div className="border-t p-4">
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/teams/${team.id}`)}
                    >
                      Apply <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
