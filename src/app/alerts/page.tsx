"use client";

import { Bell, Settings, Check, X, Clock, Trophy, Users, MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AlertsPage() {
  const notifications = [
    {
      id: 1,
      type: "live_match",
      icon: "🏀",
      title: "Lakers vs Celtics is live now!",
      description: "Watch the NBA match live",
      time: "Just now",
      unread: true,
      category: "matches",
      bgColor: "bg-red-50 border-red-200"
    },
    {
      id: 2,
      type: "live_match",
      icon: "⚽",
      title: "Liverpool vs Man City is live now!",
      description: "Watch the Premier League match live",
      time: "Just now",
      unread: true,
      category: "matches",
      bgColor: "bg-red-50 border-red-200"
    },
    {
      id: 3,
      type: "connection",
      avatar: "/api/placeholder/40/40",
      title: "Serena Williams accepted your connection request",
      description: "You are now connected with Serena Williams",
      time: "2 hours ago",
      unread: false,
      category: "connections",
      bgColor: "bg-green-50 border-green-200",
      action: "View Profile"
    },
    {
      id: 4,
      type: "like",
      avatar: "/api/placeholder/40/40",
      title: "Lebron James liked your post",
      description: 'Your post "Training day! Working on my jump shot..." received a like',
      time: "4 hours ago",
      unread: false,
      category: "activity",
      bgColor: "bg-blue-50 border-blue-200"
    },
    {
      id: 5,
      type: "message",
      avatar: "/api/placeholder/40/40",
      title: "New message from Lebron James",
      description: "Hey Michael, are you joining the charity event next week?",
      time: "1 day ago",
      unread: false,
      category: "messages",
      bgColor: "bg-gray-50 border-gray-200"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-gray-600">Stay updated with match alerts, connection requests, and more</p>
        </div>

        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Notification Settings
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-4">
          {notifications.filter(n => n.unread).map((notification) => (
            <Card key={notification.id} className={`${notification.bgColor} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {notification.type === "live_match" ? (
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-red-600" />
                      </div>
                    ) : (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.avatar} />
                        <AvatarFallback>
                          {notification.type === "connection" ? "SW" :
                           notification.type === "like" ? "LJ" :
                           notification.type === "message" ? "LJ" : "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        {notification.unread && (
                          <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {notification.action && (
                      <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                        {notification.action}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`${notification.unread ? notification.bgColor : "bg-white border-gray-200"} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {notification.type === "live_match" ? (
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-red-600" />
                      </div>
                    ) : notification.type === "connection" ? (
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>SW</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    ) : notification.type === "like" ? (
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>LJ</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Heart className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>LJ</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                          <MessageSquare className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        {notification.unread && (
                          <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {notification.action && (
                      <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                        {notification.action}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
