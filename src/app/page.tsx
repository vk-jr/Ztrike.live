"use client";

import { Heart, MessageCircle, Share2, Calendar, Bell, Users, TrendingUp, Clock, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostDisplay from "@/components/posts/PostDisplay";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/AuthContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/lib/db";
import { UserProfile } from "@/types/database";
import Link from "next/link";
import PeopleYouMayKnow from "@/components/people/PeopleYouMayKnow";
import PostCreate from "@/components/posts/PostCreate";

export default function HomePage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const recentActivity = [
    {
      type: "match",
      icon: "🏀",
      title: "NBA Finals has started.",
      description: "Lakers vs. Celtics is live now.",
      time: "2 hours ago"
    },
    {
      type: "connection",
      icon: "👥",
      title: "Serena Williams accepted your connection request.",
      time: "Yesterday"
    },
    {
      type: "like",
      icon: "❤️",
      title: "25 people liked your post about training techniques.",
      time: "2 days ago"
    },
  ];

  const upcomingMatches = [
    {
      league: "NBA • Western Conference",
      date: "4/1/2025 03:37 PM",
      homeTeam: "Warriors",
      awayTeam: "Bulls",
      homeLogo: "🌉",
      awayLogo: "🐂"
    }
  ];

  const trendingTopics = [
    { hashtag: "#NBADraft2023", posts: "52.3K posts" },
    { hashtag: "#OlympicQualifiers", posts: "30.7K posts" },
    { hashtag: "#F1GrandPrix", posts: "24.2K posts" },
    { hashtag: "#WimbledonFinals", posts: "18.9K posts" },
  ];

  return (
    <div className="container mx-auto p-4 max-w 7xl">
      <div className="grid grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="col-span-3">
          <Card className="sticky top-20 overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
            <CardContent className="pt-0 p-6 -mt-12">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 ring-4 ring-white">
                  <AvatarImage src={userProfile?.photoURL || user?.photoURL || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-xl">
                    {(userProfile?.firstName?.[0] || userProfile?.displayName?.[0] || user?.displayName?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold mt-3">
                  {(userProfile?.firstName || (user?.displayName?.split(' ')[0])) + ' ' + 
                   (userProfile?.lastName || (user?.displayName?.split(' ').slice(1).join(' ')))}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {userProfile?.email || user?.email}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {userProfile?.bio || "No bio added yet"}
                </p>
                <Badge variant="outline" className="mt-2 text-xs font-normal">
                  {userProfile?.teams?.length ? 'Team Member' : 'Amateur Athlete'}
                </Badge>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 w-full">
                  <div className="text-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="text-2xl font-bold text-gray-900">{userProfile?.connections || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">Connections</div>
                  </div>
                  <div className="text-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="text-2xl font-bold text-gray-900">{userProfile?.postViews || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">Post Views</div>
                  </div>
                </div>
                <Link href="/profile" className="w-full mt-4">
                  <Button className="w-full" variant="outline">
                    View Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="col-span-6">
          {/* Create Post Card */}
          <PostCreate />

          {/* Live Matches */}
          <Card className="mb-4 bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <h3 className="text-base font-medium">Live Matches</h3>
                </div>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-xs py-1 h-7">
                  View All →
                </Button>
              </div>
              <div className="space-y-2">
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-white/20 text-xs px-2 py-0">NBA</Badge>
                    <Badge className="bg-red-500 text-xs px-2 py-0">LIVE</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <div className="text-lg">🏀</div>
                      <div className="text-sm">Lakers</div>
                    </div>
                    <div className="text-lg font-bold">78 - 82</div>
                    <div className="flex items-center gap-1">
                      <div className="text-sm">Celtics</div>
                      <div className="text-lg">☘️</div>
                    </div>
                  </div>
                  <div className="text-center mt-1 text-xs opacity-80">Round 2</div>
                  <Button className="w-full mt-1 bg-white/20 hover:bg-white/30 h-7 text-xs">
                    Watch Now →
                  </Button>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-white/20 text-xs px-2 py-0">Premier League</Badge>
                    <Badge className="bg-red-500 text-xs px-2 py-0">LIVE</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <div className="text-lg">🔴</div>
                      <div className="text-sm">Liverpool</div>
                    </div>
                    <div className="text-lg font-bold">2 - 1</div>
                    <div className="flex items-center gap-1">
                      <div className="text-sm">Man City</div>
                      <div className="text-lg">🔵</div>
                    </div>
                  </div>
                  <div className="text-center mt-1 text-xs opacity-80">Round 2</div>
                  <Button className="w-full mt-1 bg-white/20 hover:bg-white/30 h-7 text-xs">
                    Watch Now →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="col-span-6">
            <PostDisplay userId={user?.uid ?? ''} showAllPosts={true} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3">
          {/* Upcoming Matches */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                    <span>Upcoming Matches</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMatches.map((match, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="text-sm text-gray-500 mb-2">{match.league}</div>
                    <div className="text-xs text-gray-400 mb-2">{match.date}</div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{match.homeLogo}</span>
                        <span>{match.homeTeam}</span>
                      </div>
                      <span className="text-sm font-medium">vs</span>
                      <div className="flex items-center gap-2">
                        <span>{match.awayTeam}</span>
                        <span className="text-xl">{match.awayLogo}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="outline" size="sm" className="w-full">
                        <Bell className="w-4 h-4 mr-1" />
                        Remind Me
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-1" />
                        Add to Calendar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View All Matches
              </Button>
            </CardContent>
          </Card>

          {/* People You May Know */}
          {user && <PeopleYouMayKnow />}

          {/* Trending in Sports */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-gray-500" />
                  <span>Trending in Sports</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      {topic.hashtag}
                    </span>
                    <span className="text-sm text-gray-500">{topic.posts}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
