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
import { Trophy, Users, Table, Calendar, BarChart } from 'lucide-react';
import type { UserProfile } from '@/types/database';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function LeagueDashboardPage() {
  return (
    <ProtectedRoute allowedTypes={['league']}>
      <LeagueDashboard />
    </ProtectedRoute>
  );
}

function LeagueDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [leagueData, setLeagueData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const fetchLeagueData = async () => {
      try {
        const leagueDoc = await getDoc(doc(db, 'users', user.uid));
        if (leagueDoc.exists()) {
          const data = leagueDoc.data() as UserProfile;
          if (data.userType !== 'league') {
            router.push('/profile');
            return;
          }
          setLeagueData(data);
        }
      } catch (error) {
        console.error('Error fetching league data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [user, router]);

  if (!user || loading) {
    return <div>Loading...</div>;
  }

  if (!leagueData) {
    return <div>Error loading league data</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* League Info Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              League Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={leagueData.photoURL || ''} />
                <AvatarFallback>
                  {leagueData.displayName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{leagueData.displayName}</h2>
                <p className="text-gray-500">{leagueData.sports?.join(', ')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Teams</div>
                  <div className="text-2xl font-bold">{leagueData.leagueInfo?.teamsCount || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500">Season</div>
                  <div className="text-2xl font-bold">{leagueData.leagueInfo?.currentSeason || '2025'}</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="md:col-span-2">
          <Tabs defaultValue="standings">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="standings">
                <Table className="h-4 w-4 mr-2" />
                Standings
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>League Standings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Position</th>
                          <th className="text-left py-2">Team</th>
                          <th className="text-center py-2">Played</th>
                          <th className="text-center py-2">Won</th>
                          <th className="text-center py-2">Drawn</th>
                          <th className="text-center py-2">Lost</th>
                          <th className="text-center py-2">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-center py-8 text-gray-500">
                          <td colSpan={7}>No teams in the league yet</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>League Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Teams will be listed here */}
                    <div className="text-center py-8 text-gray-500">
                      No teams have joined the league yet
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Schedule will be listed here */}
                    <div className="text-center py-8 text-gray-500">
                      No matches scheduled yet
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>League Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-500">Total Matches</div>
                        <div className="text-2xl font-bold">0</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-500">Goals Scored</div>
                        <div className="text-2xl font-bold">0</div>
                      </CardContent>
                    </Card>
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
