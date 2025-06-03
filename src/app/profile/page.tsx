"use client";

import { Edit, Share2, Calendar, Trophy, Users, Eye, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  getUserProfile, 
  getUserTeams, 
  getUserLeagues, 
  getSuggestedUsers,
  createConnection 
} from "@/lib/db";
import type { UserProfile, Team, League } from "@/types/database";
import PostCreate from "@/components/posts/PostCreate";
import PostDisplay from "@/components/posts/PostDisplay";
import PeopleYouMayKnow from "@/components/people/PeopleYouMayKnow";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  Icon: LucideIcon;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          setConnectionCount(profile?.connections?.length || 0);
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserProfile();

    // Add event listener for connection count updates
    const handleConnectionCountUpdate = (event: CustomEvent) => {
      setConnectionCount(event.detail.count);
    };

    window.addEventListener('connectionCountUpdated', handleConnectionCountUpdate as EventListener);

    return () => {
      window.removeEventListener('connectionCountUpdated', handleConnectionCountUpdate as EventListener);
    };
  }, [user]);

  // Add a function to update connection count
  const updateConnectionCount = (newCount: number) => {
    setConnectionCount(newCount);
  };

  if (!user || !userProfile) {
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

  const stats: StatItem[] = [
    {
      label: "Connections",
      value: connectionCount,
      Icon: Users
    },
    {
      label: "Teams",
      value: teams.length,
      Icon: Users
    },
    {
      label: "Leagues",
      value: leagues.length,
      Icon: Trophy
    },
    {
      label: "Post Views",
      value: userProfile?.postViews || 0,
      Icon: Eye
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Sports Theme */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 pb-32 pt-12">
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8 text-center">
            <Avatar className="h-32 w-32 mx-auto ring-4 ring-white bg-white">
              <AvatarImage src={userProfile?.photoURL || user?.photoURL || ''} />
              <AvatarFallback className="text-4xl">
                {(userProfile?.firstName?.[0] || userProfile?.displayName?.[0] || user?.displayName?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4">              <h2 className="text-3xl font-bold text-white">
                {(userProfile?.firstName || (user?.displayName?.split(' ')[0])) + ' ' + 
                 (userProfile?.lastName || (user?.displayName?.split(' ').slice(1).join(' ')))}
              </h2>
              <p className="mt-2 text-lg text-blue-100">{userProfile?.email || user?.email}</p>
              <p className="mt-2 text-blue-100">
                {userProfile?.bio || "No bio added yet"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  <stat.Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="space-y-4">
            <PostCreate />
            <PostDisplay userId={user.uid} />
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-2xl">🏆</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">League Champion</h3>
                    <p className="text-sm text-gray-500">2023 • NBA Finals MVP</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-2xl">🥇</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">MVP Award</h3>
                    <p className="text-sm text-gray-500">2022 • All-Star Game MVP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-block w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">📈</span>
                Performance Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-700 py-1 pr-4">Matches Played</td>
                    <td className="font-semibold text-gray-900 py-1">48</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700 py-1 pr-4">Wins</td>
                    <td className="font-semibold text-green-600 py-1">32</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700 py-1 pr-4">Losses</td>
                    <td className="font-semibold text-red-500 py-1">16</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-gray-700 py-1 pr-4">Win Rate</td>
                    <td className="font-semibold text-blue-600 py-1">66.7%</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
