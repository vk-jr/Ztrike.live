"use client";

import { Edit, Share2, Calendar } from "lucide-react";
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

  const achievements = [
    {
      icon: "🏆",
      title: "League Champion",
      year: "2023",
      description: "NBA Finals MVP with record-breaking performance",
      color: "text-yellow-600 bg-yellow-50"
    },
    {
      icon: "🥇",
      title: "MVP Award",
      year: "2022",
      description: "All-Star Game MVP with 42 points",
      color: "text-orange-600 bg-orange-50"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="w-full h-[250px] sm:h-[300px] bg-gradient-to-br from-blue-500 to-cyan-400 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Profile Image */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 sm:left-10 sm:translate-x-0">
          <Avatar className="h-32 w-32 ring-4 ring-white bg-white shadow-lg">
            <AvatarImage src={user?.photoURL || ''} />
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
          <Button className="bg-white/95 backdrop-blur-sm hover:bg-white text-black">
            <Edit className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - About */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  {userProfile?.displayName || user.email}
                </h2>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {userProfile?.bio || "No bio added yet"}
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-gray-500 text-sm bg-gray-50">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "Recently"}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200">
                    <div className="text-2xl font-bold text-blue-600">{userProfile?.connections || 0}</div>
                    <div className="text-sm text-gray-600 font-medium">Connections</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200">
                    <div className="text-2xl font-bold text-purple-600">{teams.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Teams</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200">
                    <div className="text-2xl font-bold text-orange-600">{leagues.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Leagues</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200">
                    <div className="text-2xl font-bold text-green-600">{userProfile?.postViews || 0}</div>
                    <div className="text-sm text-gray-600 font-medium">Post Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              <PostCreate />
              <Card className="border-0 shadow-sm overflow-hidden">
                <Tabs defaultValue="posts">
                  <TabsList className="w-full bg-gray-50/80 p-1">
                    <TabsTrigger value="posts" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Posts</TabsTrigger>
                    <TabsTrigger value="teams" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Teams</TabsTrigger>
                    <TabsTrigger value="leagues" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Leagues</TabsTrigger>
                    <TabsTrigger value="achievements" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Achievements</TabsTrigger>
                  </TabsList>

                  <TabsContent value="posts" className="p-6">
                    {user && <PostDisplay userId={user.uid} />}
                  </TabsContent>

                  <TabsContent value="teams" className="p-6">
                    {teams.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {teams.map((team) => (
                          <Card key={team.id} className="border hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center text-2xl">
                                  {team.logo || "🏃"}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                                  <p className="text-sm text-gray-500">{team.sport}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                          🎯
                        </div>
                        <p className="text-gray-600 mb-4">Not a member of any team yet</p>
                        <Button variant="outline" size="lg" className="hover:bg-gray-50">
                          Join or create a team
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="leagues" className="p-6">
                    {leagues.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {leagues.map((league) => (
                          <Card key={league.id} className="border hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full flex items-center justify-center text-2xl">
                                  🎮
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{league.name}</h3>
                                  <p className="text-sm text-gray-500">Active League</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                          🏆
                        </div>
                        <p className="text-gray-600 mb-4">Not participating in any leagues yet</p>
                        <Button variant="outline" size="lg" className="hover:bg-gray-50">
                          Browse leagues
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="achievements" className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <Card key={index} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-full flex items-center justify-center text-2xl">
                                {achievement.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                                <p className="text-sm text-gray-500">{achievement.year}</p>
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                              {achievement.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
