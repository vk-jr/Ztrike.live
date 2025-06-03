"use client";

import { Search, Send, Phone, Video, MoreVertical, MessageSquare, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(0);

  const conversations = [
    {
      id: 1,
      name: "Serena Williams",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Thanks for the connection! Looking forward to collaborating.",
      time: "2m ago",
      unread: true,
      online: true
    },
    {
      id: 2,
      name: "LeBron James",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Hey, are you joining the charity event next week?",
      time: "1h ago",
      unread: false,
      online: false
    },
    {
      id: 3,
      name: "Tom Brady",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Great game last night! 🏈",
      time: "3h ago",
      unread: false,
      online: true
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Serena Williams",
      content: "Hi! Thanks for connecting with me on ZTRIKE.",
      time: "10:30 AM",
      isMe: false
    },
    {
      id: 2,
      sender: "Me",
      content: "Hey Serena! Great to connect. I've been following your career for years.",
      time: "10:32 AM",
      isMe: true
    },
    {
      id: 3,
      sender: "Serena Williams",
      content: "That's so kind! I saw your profile - impressive stats. What sport do you primarily focus on?",
      time: "10:35 AM",
      isMe: false
    },
    {
      id: 4,
      sender: "Me",
      content: "I'm mainly into basketball, but I love following tennis too. Your mental toughness is legendary!",
      time: "10:37 AM",
      isMe: true
    },
    {
      id: 5,
      sender: "Serena Williams",
      content: "Thanks for the connection! Looking forward to collaborating.",
      time: "10:40 AM",
      isMe: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                  <Badge className="bg-blue-600 text-white">3</Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="overflow-y-auto">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat === index ? "bg-blue-50 border-r-2 border-r-blue-600" : ""
                    }`}
                    onClick={() => setSelectedChat(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.avatar} alt={conversation.name} />
                          <AvatarFallback>
                            {conversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conversation.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversations[selectedChat].avatar} />
                    <AvatarFallback>
                      {conversations[selectedChat].name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {conversations[selectedChat].online && (
                    <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {conversations[selectedChat].name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {conversations[selectedChat].online ? "Online" : "Last seen 1h ago"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isMe
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isMe ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="pr-12"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
