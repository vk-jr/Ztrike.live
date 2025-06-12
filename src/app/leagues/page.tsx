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
  const [cricketLeagues, setCricketLeagues] = useState<any[]>([]);
  const [basketballLeagues, setBasketballLeagues] = useState<any[]>([]);
  const [hockeyLeagues, setHockeyLeagues] = useState<any[]>([]);
  const router = useRouter();

  const sports = [
    { id: "cricket", name: "Cricket", color: "bg-teal-100 text-teal-700 border-teal-200" },
    { id: "football", name: "Football", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: "basketball", name: "Basketball", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: "hockey", name: "Hockey", color: "bg-purple-100 text-purple-700 border-purple-200" },
   { id: "baseball", name: "Baseball", color: "bg-red-100 text-red-700 border-red-200" },
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
    const fetchLeagues = async () => {
      if (selectedSport === 'all') return;
      
      try {
        const leaguesCol = collection(db, "leagues", selectedSport, "leagues");
        const snapshot = await getDocs(leaguesCol);
        const leagueDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Set the leagues state based on selected sport
        switch(selectedSport) {
          case 'football':
            setFootballLeagues(leagueDocs);
            break;
          case 'cricket':
            setCricketLeagues(leagueDocs);
            break;
          case 'basketball':
            setBasketballLeagues(leagueDocs);
            break;
          case 'hockey':
            setHockeyLeagues(leagueDocs);
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${selectedSport} leagues:`, error);
      }
    };

    fetchLeagues();
  }, [selectedSport]);

  // Sport-specific emojis for league icons
  const sportIcons = {
    football: "⚽",
    cricket: "🏏",
    basketball: "🏀",
    hockey: "🏑"
  };

  // Get the current leagues based on selected sport
  const getCurrentLeagues = () => {
    switch(selectedSport) {
      case 'football':
        return footballLeagues;
      case 'cricket':
        return cricketLeagues;
      case 'basketball':
        return basketballLeagues;
      case 'hockey':
        return hockeyLeagues;
      default:
        return [];
    }
  };

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
          <CardContent className="p-0 h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25103381.17961603!2d-95.677068!3d37.062500000000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sUnited%20States!5e0!3m2!1sen!2sus!4v1717848000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
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
                {showMap ? `${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} leagues from around the world` : "Major sports leagues from around the world"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSport !== 'all' ? (
                getCurrentLeagues().map((league) => (
                  <div key={league.id} className="flex items-center justify-between cursor-pointer" onClick={() => router.push(`/leagues/${encodeURIComponent(league.id)}`)}>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{sportIcons[selectedSport as keyof typeof sportIcons]}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{league.name || league.id}</h3>
                        {league.description && <p className="text-sm text-gray-600">{league.description}</p>}
                        {!league.description && <p className="text-sm text-gray-600">{selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}</p>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">View</Button>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Select a sport to view leagues</div>
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
