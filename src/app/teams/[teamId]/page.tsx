"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TeamProfile {
  id: string;
  name: string;
  logo: string;
  sport: string;
  description: string;
  founded: string;
  photoURL: string;
  achievements: Array<{
    title: string;
    date: string;
    category: string;
  }>;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  players: Array<{
    id: string;
    name: string;
    position: string;
    photoURL?: string;
    role: 'captain' | 'vice-captain' | 'player';
    joinedDate: string;
  }>;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-48">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 bg-blue-400 rounded-full" />
            <div>
              <div className="h-8 w-48 bg-blue-400 rounded mb-2" />
              <div className="h-4 w-32 bg-blue-400 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <div className="bg-white rounded-lg p-6 mb-6 h-64" />
            <div className="bg-white rounded-lg p-6 h-48" />
          </div>
          <div className="col-span-8">
            <div className="bg-white rounded-lg p-6 mb-6 h-96" />
            <div className="bg-white rounded-lg p-6 h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WinLossChart({ wins, losses, draws, total }: { wins: number; losses: number; draws: number; total: number }) {
  const winPercent = (wins / total) * 100;
  const drawPercent = (draws / total) * 100;
  const lossPercent = (losses / total) * 100;

  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <div className="flex h-full">
        <div className="bg-green-500 h-full" style={{ width: `${winPercent}%` }} />
        <div className="bg-yellow-500 h-full" style={{ width: `${drawPercent}%` }} />
        <div className="bg-red-500 h-full" style={{ width: `${lossPercent}%` }} />
      </div>
    </div>
  );
}

export default function TeamProfilePage() {
  const { userProfile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const teamId = decodeURIComponent(params.teamId as string);
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamProfile = async () => {
      try {
        const teamDoc = doc(db, "teams", teamId);
        const teamSnap = await getDoc(teamDoc);

        if (!teamSnap.exists()) {
          setError("Team not found");
          return;
        }

        // Verify this is a team profile
        const userDoc = doc(db, "users", teamId);
        const userSnap = await getDoc(userDoc);
        
        if (!userSnap.exists() || userSnap.data()?.userType !== 'team') {
          setError("Invalid team profile");
          return;
        }

        setTeamProfile({
          id: teamSnap.id,
          ...teamSnap.data()
        } as TeamProfile);
      } catch (err) {
        console.error("Error fetching team profile:", err);
        setError("Failed to load team profile");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamProfile();
    }
  }, [teamId]);

  const isTeamOwner = userProfile?.userType === 'team' && userProfile.id === teamId;

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !teamProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Team not found"}</h2>
          <Button onClick={() => router.push('/teams')}>View All Teams</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24 ring-4 ring-white/10">
              <AvatarImage src={teamProfile.photoURL} alt={teamProfile.name} />
              <AvatarFallback className="bg-blue-500 text-white text-2xl">
                {teamProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">{teamProfile.name}</h1>
              <p className="text-blue-100">{teamProfile.sport}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Team Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" /> Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Record</span>
                      <span className="text-sm font-medium">
                        {teamProfile.wins}W - {teamProfile.draws}D - {teamProfile.losses}L
                      </span>
                    </div>
                    <WinLossChart
                      wins={teamProfile.wins}
                      losses={teamProfile.losses}
                      draws={teamProfile.draws}
                      total={teamProfile.totalMatches}
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-gray-500 mb-3">Quick Stats</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{teamProfile.totalMatches}</div>
                        <div className="text-sm text-gray-500">Total Matches</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {((teamProfile.wins / teamProfile.totalMatches) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Team Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <p className="mt-1 text-gray-900">{teamProfile.description}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Founded</div>
                  <p className="mt-1 text-gray-900">{teamProfile.founded}</p>
                </div>
                {isTeamOwner && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => router.push(`/teams/${teamId}/edit`)}
                  >
                    Edit Team Profile
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Team Players */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Players
                </CardTitle>
                {isTeamOwner && (
                  <Button variant="outline" onClick={() => router.push(`/teams/${teamId}/manage-players`)}>
                    Manage Players
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamProfile.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.photoURL} />
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {player.name}
                          {player.role !== 'player' && (
                            <Badge variant="secondary" className="ml-2">
                              {player.role === 'captain' ? 'Captain' : 'Vice Captain'}
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {player.position} • Joined {player.joinedDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" /> Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamProfile.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {achievement.category} • {achievement.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
