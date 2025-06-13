"use client";

import { Search, Send, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getUserConversations, getConversationMessages, createMessage, markMessageAsRead } from "@/lib/db";
import type { Message } from "@/types/database";
import { formatDistanceToNow, format } from 'date-fns';

type Conversation = {
  partnerId: string;
  partnerProfile: any;
  lastMessage: Message;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      try {
        const userConversations = await getUserConversations(user.uid);
        setConversations(userConversations);
        
        // Select first conversation by default
        if (userConversations.length > 0 && !selectedPartnerId) {
          setSelectedPartnerId(userConversations[0].partnerId);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !selectedPartnerId) return;
      
      try {
        const { messages: chatMessages } = await getConversationMessages(user.uid, selectedPartnerId);
        // Sort messages by createdAt timestamp in ascending order
        const sortedMessages = [...chatMessages].sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any)?.toDate();
          const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any)?.toDate();
          return dateA.getTime() - dateB.getTime();
        });
        setMessages(sortedMessages);
        
        // Mark unread messages as read
        for (const message of chatMessages) {
          if (!message.read && message.receiverId === user.uid) {
            await markMessageAsRead(message.id);
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [user, selectedPartnerId]);

  const handleSendMessage = async () => {
    if (!user || !selectedPartnerId || !newMessage.trim()) return;

    try {
      const selectedPartner = conversations.find(c => c.partnerId === selectedPartnerId)?.partnerProfile;
      
      // Create base message data
      const messageData: Partial<Message> = {
        senderId: user.uid,
        receiverId: selectedPartnerId,
        content: newMessage.trim(),
        read: false,
      };

      // Add optional fields only if they exist
      if (user.displayName ?? user.email ?? undefined) {
        messageData.senderName = user.displayName ?? user.email ?? undefined;
      }
      if (user.photoURL) {
        messageData.senderPhotoURL = user.photoURL;
      }
      if (selectedPartner?.displayName || selectedPartner?.email) {
        messageData.receiverName = selectedPartner.displayName || selectedPartner.email;
      }
      if (selectedPartner?.photoURL) {
        messageData.receiverPhotoURL = selectedPartner.photoURL;
      }

      await createMessage(messageData);
      setNewMessage("");
      
      // Refresh messages and maintain proper sorting
      const { messages: updatedMessages } = await getConversationMessages(user.uid, selectedPartnerId);
      const sortedUpdatedMessages = [...updatedMessages].sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any)?.toDate();
        const dateB = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any)?.toDate();
        return dateA.getTime() - dateB.getTime();
      });
      setMessages(sortedUpdatedMessages);
      
      // Update conversations list
      const updatedConversations = await getUserConversations(user.uid);
      const sortedUpdatedConversations = [...updatedConversations].sort((a, b) => {
        const dateA = a.lastMessage?.createdAt instanceof Date ? a.lastMessage.createdAt : (a.lastMessage?.createdAt as any)?.toDate();
        const dateB = b.lastMessage?.createdAt instanceof Date ? b.lastMessage.createdAt : (b.lastMessage?.createdAt as any)?.toDate();
        // Sort in descending order (latest first)
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      });
      setConversations(sortedUpdatedConversations);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p>Please sign in to view messages</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p>Loading conversations...</p>
      </div>
    );
  }

  const selectedConversation = conversations.find(c => c.partnerId === selectedPartnerId);

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
                  <Badge className="bg-blue-600 text-white">
                    {conversations.filter(c => c.lastMessage.receiverId === user.uid && !c.lastMessage.read).length}
                  </Badge>
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
                {conversations.map((conversation) => (
                  <div
                    key={conversation.partnerId}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPartnerId === conversation.partnerId ? "bg-blue-50 border-r-2 border-r-blue-600" : ""
                    }`}
                    onClick={() => setSelectedPartnerId(conversation.partnerId)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.partnerProfile?.photoURL} />
                        <AvatarFallback>
                          {conversation.partnerProfile?.displayName?.[0] || conversation.partnerProfile?.email?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.partnerProfile?.displayName || conversation.partnerProfile?.email}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              conversation.lastMessage.createdAt instanceof Date
                                ? conversation.lastMessage.createdAt
                                : (conversation.lastMessage.createdAt as any)?.toDate()
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      {conversation.lastMessage.receiverId === user.uid && !conversation.lastMessage.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
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
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.partnerProfile?.photoURL} />
                      <AvatarFallback>
                        {selectedConversation.partnerProfile?.displayName?.[0] || selectedConversation.partnerProfile?.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.partnerProfile?.displayName || selectedConversation.partnerProfile?.email}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user.uid
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className="text-xs text-gray-500">
                            {message.createdAt instanceof Date
                              ? format(message.createdAt, "MMM d, yyyy h:mm a")
                              : format((message.createdAt as any)?.toDate(), "MMM d, yyyy h:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
