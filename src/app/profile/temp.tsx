"use client";

import { Edit, Share2, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserProfile, getUserTeams, getUserLeagues } from "@/lib/db";
import type { UserProfile, Team, League } from "@/types/database";
import PostCreate from "@/components/posts/PostCreate";
import PostDisplay from "@/components/posts/PostDisplay";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const [profile, userTeams, userLeagues] = await Promise.all([
          getUserProfile(user.uid),
          getUserTeams(user.uid),
          getUserLeagues(user.uid)
        ]);
        if (profile) setUserProfile(profile);
        setTeams(userTeams);
        setLeagues(userLeagues);
      }
    };
    fetchUserData();
  }, [user]);

  if (!user) {
    router.push("/sign-in");
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

  return (
    <div className="w-full">
      {/* Cover Image */}
      <div className="w-full h-[300px] bg-gradient-to-br from-blue-500 to-cyan-400 relative">
        {/* Profile Image */}
        <div className="absolute -bottom-16 left-10">
          <Avatar className="h-32 w-32 ring-4 ring-white bg-white">
            <AvatarImage src={user?.photoURL || ''} />
            <AvatarFallback className="text-4xl">
              {userProfile?.displayName?.[0] || user?.email?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* Action Buttons */}
        <div className="absolute right-5 bottom-5 flex gap-2">
          <Button variant="outline" className="bg-white">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
          <Button className="bg-white hover:bg-gray-50 text-black">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - About */}
          <div className="col-span-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-2">
                  {userProfile?.displayName || user.email}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {userProfile?.bio || "No bio added yet"}
                </p>
                <div className="flex items-center text-gray-500 text-sm mb-6">                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {userProfile?.createdAt ?
                    (userProfile.createdAt instanceof Date
                      ? userProfile.createdAt.toLocaleDateString()
                      : (userProfile.createdAt as any).toDate().toLocaleDateString())
                    : "Recently"}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{userProfile?.connections || 0}</div>
                    <div className="text-sm text-gray-500">Connections</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{teams.length}</div>
                    <div className="text-sm text-gray-500">Teams</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{leagues.length}</div>
                    <div className="text-sm text-gray-500">Leagues</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{userProfile?.postViews || 0}</div>
                    <div className="text-sm text-gray-500">Post Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-8">
            <PostCreate />
            <Tabs defaultValue="posts" className="mt-6">
              <TabsList className="w-full border-b">
                <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
                <TabsTrigger value="teams" className="flex-1">Teams</TabsTrigger>
                <TabsTrigger value="leagues" className="flex-1">Leagues</TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-6">
                {user && <PostDisplay userId={user.uid} />}
              </TabsContent>
              
              <TabsContent value="teams">
                {teams.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <Card key={team.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              {team.logo || "🏃"}
                            </div>
                            <div>
                              <h3 className="font-semibold">{team.name}</h3>
                              <p className="text-sm text-gray-500">{team.sport}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <p>Not a member of any team yet</p>
                    <Button variant="outline" className="mt-4">
                      Join or create a team
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="leagues">
                {leagues.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {leagues.map((league) => (
                      <Card key={league.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{league.name}</h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    <p>Not participating in any leagues</p>
                    <Button variant="outline" className="mt-4">
                      Browse leagues
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="achievements">
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🏆</div>
                        <div>
                          <h3 className="font-semibold">League Champion</h3>
                          <p className="text-sm text-gray-500">2024 Season MVP</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🥇</div>
                        <div>
                          <h3 className="font-semibold">Top Scorer</h3>
                          <p className="text-sm text-gray-500">Winter Tournament 2024</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
