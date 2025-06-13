"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Users, UserPlus, Clock, BarChart } from 'lucide-react';
import type { UserProfile } from '@/types/database';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function TeamDashboardPage() {
  return (
    <ProtectedRoute allowedTypes={['team']}>
      <TeamDashboard />
    </ProtectedRoute>
  );
}

function TeamDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [teamData, setTeamData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [playersData, setPlayersData] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const fetchTeamData = async () => {
      try {
        const teamDoc = await getDoc(doc(db, 'users', user.uid));
        if (teamDoc.exists()) {
          const data = teamDoc.data() as UserProfile;
          if (data.userType !== 'team') {
            router.push('/profile');
            return;
          }
          setTeamData(data);

          // Fetch details for each player
          if (data.teamInfo?.players && data.teamInfo.players.length > 0) {
            const playerPromises = data.teamInfo.players.map(async (player) => {
              const playerDoc = await getDoc(doc(db, 'users', player.id));
              if (playerDoc.exists()) {
                return { id: player.id, ...playerDoc.data() } as UserProfile;
              }
              return null;
            });
            const fetchedPlayers = (await Promise.all(playerPromises)).filter(player => player !== null) as UserProfile[];
            setPlayersData(fetchedPlayers);
          }
        }
      } catch (error) {
        console.error('Error fetching team data or player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user, router]);

  if (!user || loading) {
    return <div>Loading...</div>;
  }

  if (!teamData) {
    return <div>Error loading team data</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Info Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={teamData.photoURL || ''} />
                <AvatarFallback>
                  {teamData.displayName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{teamData.displayName}</h2>
                <p className="text-gray-500">{teamData.sports?.join(', ')}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{teamData.teamInfo?.wins || 0}</div>
                <div className="text-sm text-gray-500">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{teamData.teamInfo?.losses || 0}</div>
                <div className="text-sm text-gray-500">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{teamData.teamInfo?.draws || 0}</div>
                <div className="text-sm text-gray-500">Draws</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="md:col-span-2">
          <Tabs defaultValue="players">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="players">
                <Users className="h-4 w-4 mr-2" />
                Players
              </TabsTrigger>
              <TabsTrigger value="recruiter">
                <UserPlus className="h-4 w-4 mr-2" />
                Recruiter
              </TabsTrigger>
              <TabsTrigger value="matches">
                <Clock className="h-4 w-4 mr-2" />
                Matches
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Players</CardTitle>
                </CardHeader>
                <CardContent>
                  {playersData && playersData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {playersData.map((player) => (
                        <Card key={player.id} className="p-4">
                          <CardContent className="flex items-center space-x-4 p-0">
                            <Avatar>
                              <AvatarImage src={player.photoURL || ''} />
                              <AvatarFallback>{player.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg">{player.displayName}</h3>
                                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Available</span>
                              </div>
                              <p className="text-sm text-gray-500">{player.position} • {player.sports?.[0] || 'N/A'}</p>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <BarChart className="h-4 w-4 text-gray-400" />
                                  Goals: {player.Goals || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart className="h-4 w-4 text-gray-400" />
                                  Assists: {player.assist || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart className="h-4 w-4 text-gray-400" />
                                  MVPs: {player.MVPs || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                  <BarChart className="h-4 w-4 text-gray-400" />
                                  Matches: {player.matchesPlayed || 0}
                                </div>
                              </div>
                              <div className="mt-2 p-2 bg-yellow-50 rounded-lg flex items-center gap-2">
                                <BarChart className="h-4 w-4 text-yellow-600" />
                                <span className="font-medium text-yellow-800">Rank Score: {player.rankScore?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          </CardContent>
                          <div className="mt-4">
                            <Button className="w-full">Start Recruitment</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No players in the team yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recruiter" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Hub</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Open Positions</h3>
                      {teamData.teamInfo?.recruiterInfo?.openPositions && 
                       teamData.teamInfo.recruiterInfo.openPositions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teamData.teamInfo.recruiterInfo.openPositions.map((position, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <h4 className="font-medium">{position}</h4>
                                <p className="text-sm text-gray-500">
                                  {teamData.teamInfo?.recruiterInfo?.requirements?.[index] || 'No specific requirements'}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No open positions currently
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Position
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No recent matches
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-500">Win Rate</div>
                          <div className="text-2xl font-bold">
                            {teamData.teamInfo?.wins && 
                             (teamData.teamInfo.wins + teamData.teamInfo.losses + teamData.teamInfo.draws) > 0
                              ? Math.round(
                                  (teamData.teamInfo.wins /
                                    (teamData.teamInfo.wins +
                                      teamData.teamInfo.losses +
                                      teamData.teamInfo.draws)) *
                                    100
                                ) + '%'
                              : 'N/A'}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-500">Total Matches</div>
                          <div className="text-2xl font-bold">
                            {(teamData.teamInfo?.wins || 0) +
                              (teamData.teamInfo?.losses || 0) +
                              (teamData.teamInfo?.draws || 0)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
