"use client";

import { useState, useEffect } from "react";
import { Search, Trophy, Clock, Calendar, Map as MapIcon, Globe, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LeaguesPage() {
  const [showMap, setShowMap] = useState(false);
  const [selectedSport, setSelectedSport] = useState("all");
  const [footballLeagues, setFootballLeagues] = useState<any[]>([]);
  const router = useRouter();

  const sports = [
    { id: "basketball", name: "Basketball", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: "football", name: "Football", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: "baseball", name: "Baseball", color: "bg-red-100 text-red-700 border-red-200" },
    { id: "hockey", name: "Hockey", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { id: "soccer", name: "Soccer", color: "bg-green-100 text-green-700 border-green-200" },
    { id: "golf", name: "Golf", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { id: "cycling", name: "Cycling", color: "bg-violet-100 text-violet-700 border-violet-200" },
    { id: "all", name: "All", color: "bg-gray-100 text-gray-700 border-gray-200" },
  ];

  const leagues = [
    {
      name: "NBA",
      sport: "Basketball",
      subscribed: true,
      logo: "🏀"
    },
    {
      name: "NFL",
      sport: "American Football",
      subscribed: true,
      logo: "🏈"
    },
    {
      name: "Premier League",
      sport: "Soccer",
      subscribed: true,
      logo: "⚽"
    },
  ];

  const liveMatches = [
    {
      league: "NBA",
      homeTeam: "Lakers",
      awayTeam: "Celtics",
      homeScore: "78",
      awayScore: "82",
      quarter: "Q3 5:42",
      homeLogo: "🏀",
      awayLogo: "🍀"
    },
    {
      league: "Premier League",
      homeTeam: "Liverpool",
      awayTeam: "Man City",
      homeScore: "2",
      awayScore: "1",
      quarter: "65'",
      homeLogo: "🔴",
      awayLogo: "🔵"
    },
  ];

  useEffect(() => {
    if (selectedSport === "football") {
      const fetchLeagues = async () => {
        const leaguesCol = collection(db, "leagues", "football", "leagues");
        const snapshot = await getDocs(leaguesCol);
        const leagueDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFootballLeagues(leagueDocs);
      };
      fetchLeagues();
    }
  }, [selectedSport]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leagues & Live Scores</h1>
        <p className="text-gray-600">Follow your favorite leagues and never miss a match</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search leagues or sports..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Sports Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Sport</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sports.map((sport) => (
            <Button
              key={sport.id}
              variant={selectedSport === sport.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSport(sport.id)}
              className={selectedSport === sport.id ? "" : sport.color}
            >
              {sport.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Map Toggle */}
      <div className="mb-6 flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2"
        >
          {showMap ? <Globe className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
          {showMap ? "Hide Map" : "Show Map"}
        </Button>
      </div>

      {/* World Map (when toggled) */}
      {showMap && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
              {/* Simplified world map representation */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                <svg viewBox="0 0 800 400" className="w-full h-full">
                  {/* Simplified continents */}
                  <path d="M100 150 L200 120 L250 160 L200 200 L150 180 Z" fill="#e5e7eb" />
                  <path d="M300 100 L450 80 L500 140 L450 180 L350 160 Z" fill="#e5e7eb" />
                  <path d="M520 200 L650 180 L700 240 L650 280 L570 260 Z" fill="#e5e7eb" />

                  {/* League markers */}
                  <circle cx="150" cy="160" r="4" fill="#ef4444" />
                  <text x="155" y="150" fontSize="10" fill="#374151">NBA</text>

                  <circle cx="200" cy="140" r="4" fill="#3b82f6" />
                  <text x="205" y="130" fontSize="10" fill="#374151">Premier League</text>

                  <circle cx="600" cy="220" r="4" fill="#10b981" />
                  <text x="605" y="210" fontSize="10" fill="#374151">CBA</text>

                  <circle cx="680" cy="320" r="4" fill="#f59e0b" />
                  <text x="685" y="310" fontSize="10" fill="#374151">NBL</text>
                </svg>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button size="sm" variant="outline">+</Button>
                <Button size="sm" variant="outline">-</Button>
                <Button size="sm" variant="outline">Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Leagues Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Leagues
              </CardTitle>
              <p className="text-sm text-gray-600">
                {showMap ? "Football leagues from around the world" : "Major sports leagues from around the world"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSport === "football" ? (
                footballLeagues.map((league) => (
                  <div key={league.id} className="flex items-center justify-between cursor-pointer" onClick={() => router.push(`/leagues/${encodeURIComponent(league.id)}`)}>
                  <div className="flex items-center space-x-3">
                      <div className="text-2xl">⚽</div>
                    <div>
                        <h3 className="font-medium text-gray-900">{league.name || league.id}</h3>
                        {league.description && <p className="text-sm text-gray-600">{league.description}</p>}
                        {!league.description && <p className="text-sm text-gray-600">Football</p>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">View</Button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Select Football to view leagues</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Live Matches
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Matches
              </TabsTrigger>
              <TabsTrigger value="my-leagues" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                My Leagues
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <h2 className="text-lg font-semibold text-red-600">Live Now</h2>
                </div>
                <p className="text-gray-600">Matches currently in progress</p>
              </div>

              <div className="space-y-4">
                {liveMatches.map((match, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="destructive" className="animate-pulse">
                            LIVE
                          </Badge>
                          <span className="font-medium text-sm">{match.league}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {match.quarter}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{match.homeLogo}</div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{match.homeTeam}</div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {match.homeScore} - {match.awayScore}
                          </div>
                          <div className="text-lg font-semibold text-red-600">VS</div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{match.awayTeam}</div>
                          </div>
                          <div className="text-2xl">{match.awayLogo}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming matches</h3>
                <p>Check back later for scheduled games</p>
              </div>
            </TabsContent>

            <TabsContent value="my-leagues" className="mt-6">
              <div className="text-center py-12 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribed leagues</h3>
                <p>Subscribe to leagues to see them here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
