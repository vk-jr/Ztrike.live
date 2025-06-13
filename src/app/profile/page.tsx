"use client";

import { Edit, Share2, Calendar, Trophy, LineChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserProfile, getUserTeams, getUserLeagues } from "@/lib/db";
import type { UserProfile, Team, League } from "@/types/database";
import Link from "next/link";
import PostCreate from "@/components/posts/PostCreate";
import PostDisplay from "@/components/posts/PostDisplay";

// Function to calculate win rate
const calculateWinRate = (wins: number, totalMatches: number): string => {
  if (totalMatches === 0) return "0%";
  return `${Math.round((wins / totalMatches) * 100)}%`;
};

function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [connectionDetails, setConnectionDetails] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const [profile, userTeams, userLeagues] = await Promise.all([
            getUserProfile(user.uid),
            getUserTeams(user.uid),
            getUserLeagues(user.uid)
          ]);
          if (profile) {
            setUserProfile(profile);
            // Fetch connection details
            const connectionProfiles = await Promise.all(
              (profile.connections || []).map(id => getUserProfile(id))
            );
            setConnectionDetails(connectionProfiles.filter(Boolean) as UserProfile[]);
          }
          setTeams(userTeams || []);
          setLeagues(userLeagues || []);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Default athlete/player profile view
  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="w-full h-[240px] relative">
        {userProfile?.bannerURL ? (
          <div className="absolute inset-0">
            <img 
              src={userProfile.bannerURL} 
              alt="Profile Banner" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        ) : (
          <div className="w-full h-full bg-[#2563eb]">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        )}
        {/* Profile Image */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <Avatar className="h-[120px] w-[120px] ring-4 ring-white bg-white shadow-lg">
            <AvatarImage src={user?.photoURL || userProfile?.photoURL || ''} alt={userProfile?.displayName || user?.email || 'Profile'} />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
              {userProfile?.displayName?.[0] || user?.email?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* Action Buttons */}
        <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="bg-white/95 backdrop-blur-sm hover:bg-white">
            <Share2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Share Profile</span>
          </Button>
          <Button className="bg-white/95 backdrop-blur-sm hover:bg-white text-black"
                  onClick={() => router.push('/profile/settings')}
          >
            <Edit className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-bold text-gray-900">
            {userProfile?.displayName || user?.displayName || 'Profile'}
          </h2>
          <Badge variant="secondary" className="text-sm font-medium">
            {userProfile?.userType === 'team' ? 'Team Account' : 'Athlete Account'}
          </Badge>
          {userProfile?.email && userProfile.email !== userProfile?.displayName && (
            <p className="text-gray-600 text-base">{userProfile.email}</p>
          )}
          <p className="text-gray-700 text-lg leading-relaxed">
            {userProfile?.bio || "No bio added yet"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {userProfile?.userType === 'team' ? (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{userProfile.teamInfo?.matchesPlayed || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Matches Played</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{userProfile.teamInfo?.wins || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Wins</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{userProfile.teamInfo?.players?.length || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Players</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{userProfile.teamInfo?.clean_sheets || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Clean Sheets</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{userProfile?.connections?.length || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Connections</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{teams.length}</div>
                <div className="text-sm text-gray-600 font-medium">Teams</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{leagues.length}</div>
                <div className="text-sm text-gray-600 font-medium">Leagues</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{userProfile?.postViews || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Post Views</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="posts" className="mt-8">
          <TabsList className="w-full flex justify-between border-b">
            <TabsTrigger value="posts" className="flex-1" onClick={() => setActiveTab("posts")}>
              Posts
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex-1" onClick={() => setActiveTab("performance")}>
              Performance
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1" onClick={() => setActiveTab("connections")}>
              Connections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              <PostCreate />
              <PostDisplay userId={user?.uid ?? ''} showAllPosts={false} />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievements Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={20} /> Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile?.achievements && userProfile.achievements.length > 0 ? (
                    userProfile.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Trophy size={24} className="text-yellow-500" />
                        <div>
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-sm text-gray-600">{achievement.year} • {achievement.description}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No achievements recorded yet.</div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart size={20} /> Performance Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-700">
                  {userProfile?.userType === 'team' ? (
                    <>
                      <div className="flex justify-between">
                        <span>Matches Played</span>
                        <span className="font-semibold">{userProfile.teamInfo?.matchesPlayed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wins</span>
                        <span className="font-semibold text-green-600">{userProfile.teamInfo?.wins || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Losses</span>
                        <span className="font-semibold text-red-600">{userProfile.teamInfo?.losses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Draws</span>
                        <span className="font-semibold text-blue-600">{userProfile.teamInfo?.draws || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win Rate</span>
                        <span className="font-semibold text-blue-600">
                          {calculateWinRate(
                            userProfile.teamInfo?.wins || 0,
                            userProfile.teamInfo?.matchesPlayed || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clean Sheets</span>
                        <span className="font-semibold text-emerald-600">{userProfile.teamInfo?.clean_sheets || 0}</span>
                      </div>
                      {userProfile.teamInfo?.location && (
                        <div className="flex justify-between">
                          <span>Home Ground</span>
                          <span className="font-semibold">{userProfile.teamInfo.location}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Current Team</span>
                        <span className="font-semibold text-gray-900">{userProfile?.currentTeam || "Not in a team"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Position</span>
                        <span className="font-semibold text-gray-900">{userProfile?.position || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Matches Played</span>
                        <span className="font-semibold">{userProfile?.matchesPlayed ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Goals</span>
                        <span className="font-semibold text-green-600">{userProfile?.Goals ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assists</span>
                        <span className="font-semibold text-blue-600">{userProfile?.assist ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MVP Awards</span>
                        <span className="font-semibold text-amber-600">{userProfile?.MVPs ?? 0}</span>
                      </div>
                      {userProfile?.Saves !== undefined && (
                        <div className="flex justify-between">
                          <span>Saves</span>
                          <span className="font-semibold text-purple-600">{userProfile.Saves}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Wins</span>
                        <span className="font-semibold text-green-600">{userProfile?.wins ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Losses</span>
                        <span className="font-semibold text-red-600">{userProfile?.losses ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win Rate</span>
                        <span className="font-semibold text-blue-600">
                          {calculateWinRate(userProfile?.wins ?? 0, userProfile?.matchesPlayed ?? 0)}
                        </span>
                      </div>
                      {userProfile?.clean_sheets !== undefined && (
                        <div className="flex justify-between">
                          <span>Clean Sheets</span>
                          <span className="font-semibold text-emerald-600">{userProfile.clean_sheets}</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {userProfile?.userType === 'team' ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Team Players</h3>
                  {userProfile.teamInfo?.players && userProfile.teamInfo.players.length > 0 ? (
                    userProfile.teamInfo.players.map((player) => (
                      <Card key={player.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <Link href={`/profile/${player.id}`} className="flex items-center gap-4 cursor-pointer">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{player.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-gray-900">{player.name}</div>
                              <div className="text-sm text-gray-600">
                                {player.position}
                                {player.number && ` • #${player.number}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                Joined {typeof player.joinDate === 'object' && 'toDate' in player.joinDate 
                                  ? player.joinDate.toDate().toLocaleDateString()
                                  : new Date(player.joinDate as any).toLocaleDateString()}
                              </div>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No players in the team yet.
                    </div>
                  )}
                  
                  {userProfile.teamInfo?.recruiterInfo?.openPositions && 
                   userProfile.teamInfo.recruiterInfo.openPositions.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
                      <div className="space-y-2">
                        {userProfile.teamInfo.recruiterInfo.openPositions.map((position, index) => (
                          <Badge key={index} variant="secondary" className="mr-2">{position}</Badge>
                        ))}
                      </div>
                      {userProfile.teamInfo.recruiterInfo.requirements && (
                        <div className="mt-4 text-sm text-gray-600">
                          <strong>Requirements:</strong>
                          <ul className="list-disc list-inside mt-2">
                            {userProfile.teamInfo.recruiterInfo.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                connectionDetails.length > 0 ? (
                  connectionDetails.map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Link href={`/profile/${connection.id}`} className="flex items-center gap-4 cursor-pointer">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={connection.photoURL || ''} alt={connection.displayName} />
                            <AvatarFallback>{connection.displayName?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">{connection.displayName}</div>
                            <div className="text-sm text-gray-600">{connection.email}</div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No connections yet.
                  </div>
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ProfilePage;
