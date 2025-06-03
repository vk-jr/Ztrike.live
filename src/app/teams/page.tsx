"use client";

import { Trophy, Users, Target, Calendar, Bell, Clock, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeamsPage() {
  const myTeams = [
    {
      name: "Chicago Bulls",
      sport: "Basketball",
      logo: "🐂",
      role: "Player",
      joinDate: "11/15/2023",
      status: "Active"
    },
    {
      name: "Dallas Cowboys",
      sport: "American Football",
      logo: "⭐",
      role: "Player",
      joinDate: "1/10/2024",
      status: "Active"
    }
  ];

  const availableTeams = [
    {
      name: "New York Knicks",
      sport: "NBA",
      logo: "🏀",
      position: "Point Guard"
    },
    {
      name: "Denver Broncos",
      sport: "NFL",
      logo: "🐎",
      position: "Quarterback"
    },
    {
      name: "Manchester City",
      sport: "Premier League",
      logo: "🔵",
      position: "Forward"
    }
  ];

  const upcomingTryouts = [
    {
      team: "Boston Celtics",
      date: "Apr 15, 2025",
      location: "Boston"
    },
    {
      team: "FC Barcelona",
      date: "May 2, 2025",
      location: "Barcelona"
    },
    {
      team: "San Francisco 49ers",
      date: "May 20, 2025",
      location: "San Francisco"
    }
  ];

  const selectionProcess = {
    team: "Los Angeles Lakers",
    sport: "Basketball",
    logo: "💜",
    stage: "Physical Assessment",
    progress: "In Progress",
    nextStep: "Skills Evaluation",
    nextDate: "3/31/2025",
    startDate: "3/15/2025",
    endDate: "4/15/2025"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section - My Teams & Selection Process */}
        <div className="space-y-6">
          {/* My Teams Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <h1 className="text-2xl font-bold">My Teams</h1>
            </div>
            <p className="text-blue-100">
              Teams you've joined and are actively participating in
            </p>
          </div>

          {/* My Teams List */}
          <div className="space-y-4">
            {myTeams.map((team, index) => (
              <Card key={index} className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{team.logo}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">{team.sport}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{team.role}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      View Details →
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                    <span>Joined on {team.joinDate}</span>
                    <Badge className="bg-green-100 text-green-700">
                      {team.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selection Processes */}
          <Card className="bg-blue-600 text-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-white">Selection Processes</CardTitle>
              </div>
              <p className="text-blue-100">Track your applications and selection progress</p>
            </CardHeader>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" className="text-blue-600 border-blue-200">
              Active
            </Button>
            <Button variant="ghost" className="text-gray-600">
              History
            </Button>
          </div>

          {/* Active Selection Process */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">{selectionProcess.logo}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectionProcess.team}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{selectionProcess.sport}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">NBA</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-blue-100 text-blue-700">
                    {selectionProcess.progress}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Stage:</span>
                  <span className="font-medium text-blue-600">{selectionProcess.stage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Period:</span>
                  <span>{selectionProcess.startDate} - {selectionProcess.endDate}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Next: {selectionProcess.nextStep}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Scheduled for {selectionProcess.nextDate}
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                View Details →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Available Teams & Tryouts */}
        <div className="space-y-6">
          {/* Available Teams Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-yellow-400" />
              <h1 className="text-2xl font-bold">Available Teams</h1>
            </div>
            <p className="text-blue-100">
              Teams currently accepting applications
            </p>
          </div>

          {/* Available Teams List */}
          <div className="space-y-4">
            {availableTeams.map((team, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{team.logo}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{team.name}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">{team.sport}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{team.position}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upcoming Tryouts */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tryouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTryouts.map((tryout, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{tryout.team}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{tryout.date}</span>
                      <span>•</span>
                      <span>{tryout.location}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" className="w-full">
                View all upcoming tryouts →
              </Button>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <p className="text-sm text-gray-600">Based on your profile and performance</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏀</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Washington Wizards</h4>
                      <div className="text-sm text-gray-600">NBA Team</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
