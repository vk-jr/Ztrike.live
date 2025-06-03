"use client";

import { Search, Users, UserPlus, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth/AuthContext";
import { useState, useEffect } from "react";
import { getPendingRequests, acceptConnectionRequest, rejectConnectionRequest, getUserProfile } from "@/lib/db";
import type { UserProfile } from "@/types/database";
import PeopleYouMayKnow from "@/components/people/PeopleYouMayKnow";
import { toast } from "@/components/ui/use-toast";

export default function NetworkPage() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<UserProfile[]>([]);
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadPendingRequests = async () => {
      if (user) {
        try {
          const requests = await getPendingRequests(user.uid);
          setPendingRequests(requests);
        } catch (error) {
          console.error('Error loading pending requests:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const loadConnections = async () => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          const connectionIds = userProfile?.connections || [];
          const connectionProfiles = await Promise.all(
            connectionIds.map(id => getUserProfile(id))
          );
          setConnections(connectionProfiles.filter(Boolean) as UserProfile[]);
        } catch (error) {
          console.error('Error loading connections:', error);
        }
      }
    };

    loadPendingRequests();
    loadConnections();

    // Listen for new connection requests and updates
    const handleNewRequest = () => {
      loadPendingRequests();
    };

    const handleConnectionsUpdate = () => {
      loadConnections();
    };
      
    window.addEventListener('connectionRequestSent', handleNewRequest as EventListener);
    window.addEventListener('connectionsUpdated', handleConnectionsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('connectionRequestSent', handleNewRequest as EventListener);
      window.removeEventListener('connectionsUpdated', handleConnectionsUpdate as EventListener);
    };
  }, [user]);

  const handleAccept = async (fromUserId: string) => {
    if (!user) return;
    
    console.log('Handling accept for user:', fromUserId);
    setProcessing(prev => ({ ...prev, [fromUserId]: true }));
    try {
      const success = await acceptConnectionRequest(user.uid, fromUserId);
      if (success) {
        console.log('Connection request accepted successfully');
        // Remove the request from pending requests
        setPendingRequests(prev => prev.filter(request => request.id !== fromUserId));
      
        // Get updated profile to reflect the new connection
        const updatedProfile = await getUserProfile(user.uid);
        if (updatedProfile) {
          // Update connection count in the profile page
          const event = new CustomEvent('connectionCountUpdated', {
            detail: { count: updatedProfile.connections?.length || 0 }
          });
          window.dispatchEvent(event);
          
          // Dispatch an event to refresh the connections list
          window.dispatchEvent(new CustomEvent('connectionsUpdated'));
        }

        toast({
          title: "Connection accepted",
          description: "You are now connected with this user",
          variant: "default",
        });
      } else {
        throw new Error('Failed to accept connection request');
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => ({ ...prev, [fromUserId]: false }));
    }
  };

  const handleReject = async (fromUserId: string) => {
    if (!user) return;
    
    setProcessing(prev => ({ ...prev, [fromUserId]: true }));
    try {
      await rejectConnectionRequest(user.uid, fromUserId);
      setPendingRequests(prev => prev.filter(request => request.id !== fromUserId));
    } catch (error) {
      console.error('Error rejecting connection request:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [fromUserId]: false }));
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
        <p className="text-gray-600">Connect with other athletes, coaches, and sports professionals</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search connections..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="connections" className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Connections
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Connections
              </CardTitle>
              <p className="text-sm text-gray-600">Manage your professional network</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading connections...</div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>You don't have any connections yet</p>
                  <p className="text-sm mt-2">Start connecting with other users to grow your network</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={connection.photoURL || ''} />
                          <AvatarFallback>{connection.displayName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{connection.displayName}</h3>
                          <p className="text-sm text-gray-600">{connection.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Connected
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Pending Requests
              </CardTitle>
              <p className="text-sm text-gray-600">Connection requests waiting for your response</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending requests</div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.photoURL || ''} />
                          <AvatarFallback>
                            {request.displayName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.displayName}</h3>
                          <p className="text-sm text-gray-600">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => {
                            console.log('Accepting request from:', request.id);
                            handleAccept(request.id);
                          }}
                          disabled={processing[request.id]}
                        >
                          <UserCheck className="h-4 w-4" />
                          {processing[request.id] ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(request.id)}
                          disabled={processing[request.id]}
                        >
                          <X className="h-4 w-4" />
                          {processing[request.id] ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* People You May Know */}
      {user && <PeopleYouMayKnow userId={user.uid} />}
    </div>
  );
}
