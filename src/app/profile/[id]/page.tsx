"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Trophy, Eye, LineChart, Heart, MessageCircle, Share, Medal, Calendar, Activity, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserProfile, createMessage, createConnectionRequest } from "@/lib/db";
import { createNotification } from "@/lib/notificationActions"; // Import createNotification
import type { UserProfile, Message } from "@/types/database";
import PostDisplay from "@/components/posts/PostDisplay";
import { useAuth } from "@/lib/auth/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner"; // Import LoadingSpinner

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = params?.id && typeof params.id === 'string' ? params.id : '';
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'not_connected' | 'pending' | 'connected'>('not_connected');
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [connectionDetails, setConnectionDetails] = useState<UserProfile[]>([]);
  const [isRecruiting, setIsRecruiting] = useState(false); // Add state for recruit loading
  const [recruitMessage, setRecruitMessage] = useState<string | null>(null); // Add state for recruit message
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const profile = await getUserProfile(userId); // Use the general getUserProfile function
        console.log("Debug fetchUserProfile: fetched profile", profile);
        if (profile) {
          setUserProfileData(profile);
          console.log("Fetched User Profile Data:", profile);
          console.log("User Type:", profile.userType);
          console.log("Team Info:", profile.teamInfo);
          
          // Fetch connection details
          const connectionProfiles = await Promise.all(
            (profile.connections || []).map(id => getUserProfile(id))
          );
          setConnectionDetails(connectionProfiles.filter(Boolean) as UserProfile[]);
        } else {
          setUserProfileData(null);
        }
      } catch (error) {
        console.error("Error fetching user profile data:", error);
        setUserProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        console.log("Debug fetchCurrentUserProfile: fetched profile", profile);
        setCurrentUserProfile(profile);
      }
    };
    fetchCurrentUserProfile();
  }, [user]);

  useEffect(() => {
    if (currentUserProfile && userProfileData) {
      if (currentUserProfile.connections.includes(userId)) {
        setConnectionStatus('connected');
      } else if (currentUserProfile.sentRequests.includes(userId)) {
        setConnectionStatus('pending');
      }
    }
  }, [currentUserProfile, userProfileData, userId]);

   // Function to calculate win rate
   const calculateWinRate = (wins: number, matchesPlayed: number) => {
    if (matchesPlayed === 0) return "N/A";
    return ((wins / matchesPlayed) * 100).toFixed(1) + "%";
  };

  const handleConnect = async () => {
    if (!user || !userProfileData || connectionStatus !== 'not_connected') return;

    setIsConnecting(true);
    try {
      const success = await createConnectionRequest(user.uid, userId);
      if (success) {
        setConnectionStatus('pending');
        // Optionally show a success toast
      } else {
        // Optionally show an error toast
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      // Optionally show an error toast
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMessageClick = async () => {
    if (!user || !userProfileData) return;
    
    try {
      // Create base message data
      const messageData: Omit<Message, 'id' | 'createdAt'> = {
        senderId: user.uid,
        receiverId: userId,
        content: `Hi! I'd like to connect with you.`,
        read: false,
        updatedAt: new Date(),
      };

      // Add optional fields only if they exist
      if (user.displayName || user.email) {
        messageData.senderName = user.displayName || user.email || undefined;
      }
      if (user.photoURL) {
        messageData.senderPhotoURL = user.photoURL;
      }
      if (userProfileData.displayName || userProfileData.email) {
        messageData.receiverName = userProfileData.displayName ?? userProfileData.email; // Use nullish coalescing
      }
      if (userProfileData.photoURL) {
        messageData.receiverPhotoURL = userProfileData.photoURL;
      }

      await createMessage(messageData);
      router.push('/messages');
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleSendRecruit = async () => {
    if (!user || !userProfileData || !currentUserProfile) return;

    try {
      setIsRecruiting(true); // Start loading
      setRecruitMessage(null); // Reset previous message

      console.log("Send Recruit clicked");

      // Send recruitment notification
      const success = await createNotification({
        type: 'recruitment',
        userId: userId, // Athlete's user ID
        fromId: user.uid, // Team's user ID
        title: `Recruitment Notification from ${currentUserProfile.displayName || currentUserProfile.email}`,
        description: `${currentUserProfile.displayName || currentUserProfile.email} is interested in recruiting you!`,
      });

      if (success) {
        setRecruitMessage("Recruitment notification sent successfully.");
      } else {
        setRecruitMessage("Failed to send recruitment notification.");
      }

      // Optionally, show a success or error toast
      console.log("Recruitment notification sent successfully");

    } catch (error) {
      console.error("Error sending recruit:", error);
      setRecruitMessage("Error sending recruitment notification.");
      // Optionally, show an error toast
    } finally {
      setIsRecruiting(false); // Stop loading
    }
  };

  useEffect(() => {
    console.log('Debug Render Condition:');
    console.log('  user:', user);
    console.log('  currentUserProfile:', currentUserProfile);
    console.log('  userProfileData:', userProfileData);
    console.log('  currentUserProfile?.accountType:', currentUserProfile?.accountType);
    console.log('  userProfileData?.accountType:', userProfileData?.accountType);
  }, [user, currentUserProfile, userProfileData]);

  if (loading) {
    return <div className="w-full min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  if (!userProfileData) {
    return <div className="w-full min-h-screen flex items-center justify-center text-red-500">User profile not found.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="w-full h-[240px] relative">
        {userProfileData?.bannerURL ? (
          <div className="absolute inset-0">
            <img 
              src={userProfileData.bannerURL} 
              alt="Profile Banner" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        ) : (
          <div className="w-full h-full bg-[#2563eb]">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        )}
        {/* Profile Image */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <Avatar className="h-[120px] w-[120px] ring-4 ring-white bg-white shadow-lg">
            <AvatarImage src={userProfileData?.photoURL || ''} alt={userProfileData?.displayName || 'Profile'} />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
              {userProfileData?.displayName?.[0] || userProfileData?.email?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* Action Buttons */}
        <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 flex flex-col sm:flex-row gap-2">
          {user && user.uid !== userId && (
            <Button
              variant="outline"
              className="bg-white/95 backdrop-blur-sm hover:bg-white"
              onClick={handleConnect}
              disabled={isConnecting || connectionStatus !== 'not_connected'}
            >
              {isConnecting ? (
                'Connecting...'
              ) : connectionStatus === 'pending' ? (
                'Request Sent'
              ) : connectionStatus === 'connected' ? (
                'Connected'
              ) : (
                'Connect'
              )}
            </Button>
          )}
          {/* Add Send Recruit button for team accounts viewing athlete profiles */}
          {user && currentUserProfile !== null && currentUserProfile.accountType === 'team' && userProfileData?.accountType === 'athlete' && (
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white"
                onClick={handleSendRecruit}
                disabled={isRecruiting}
              >
                {isRecruiting ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" /> Sending Recruit...
                  </>
                ) : (
                  'Send Recruit'
                )}
              </Button>
              {recruitMessage && (
                <p className="text-sm text-center" style={{ color: recruitMessage.includes('successfully') ? 'green' : 'red' }}>
                  {recruitMessage}
                </p>
              )}
            </div>
          )}
          <Button variant="outline" className="bg-white/95 backdrop-blur-sm hover:bg-white" onClick={handleMessageClick}>
            <MessageCircle className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Message</span>
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          {userProfileData?.displayName || userProfileData.email}
        </h2>
        <div className="flex justify-center mb-2">
          <Badge variant="secondary">
            {userProfileData?.accountType === 'team' ? 'Team Account' : 'Athlete Account'}
          </Badge>
        </div>
        {userProfileData?.email && userProfileData.email !== userProfileData?.displayName && (
           <p className="text-gray-600 text-sm mb-1">{userProfileData.email}</p>
        )}
        <p className="text-gray-700 text-base mb-3 leading-relaxed">
          {userProfileData?.bio || "No bio added yet"}
        </p>
        {userProfileData?.createdAt && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-gray-500 text-sm bg-gray-100 mb-6">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            Joined {typeof userProfileData.createdAt === 'object' && userProfileData.createdAt !== null && 'toDate' in userProfileData.createdAt && typeof userProfileData.createdAt.toDate === 'function'
                    ? userProfileData.createdAt.toDate().toLocaleDateString()
                    : new Date(userProfileData.createdAt as any).toLocaleDateString()}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {userProfileData.userType === 'team' ? (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{userProfileData.teamInfo?.matchesPlayed || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Matches Played</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{userProfileData.teamInfo?.wins || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Wins</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{userProfileData.teamInfo?.players?.length || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Players</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{userProfileData.teamInfo?.clean_sheets || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Clean Sheets</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{userProfileData?.connections?.length || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Connections</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{userProfileData?.teams?.length || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Teams</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{userProfileData?.leagues?.length || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Leagues</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{userProfileData?.postViews || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Post Views</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="posts" className="mt-4">
          <TabsList className="w-full flex justify-between border-b">
            <TabsTrigger value="posts" className="flex-1" onClick={() => setActiveTab("posts")}>
              Posts
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex-1" onClick={() => setActiveTab("performance")}>
              Performance
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1" onClick={() => setActiveTab("connections")}>
              Connections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <PostDisplay userId={userId} showAllPosts={false} />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievements Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={20} /> Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfileData?.achievements && userProfileData.achievements.length > 0 ? (
                    userProfileData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Trophy size={24} className="text-yellow-500" />
                        <div>
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-sm text-gray-600">{achievement.year} • {achievement.description}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No achievements recorded.</div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Tracking Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart size={20} /> Performance Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-700">
                  {userProfileData.userType === 'team' ? (
                    userProfileData.teamInfo ? (
                      <>
                        <div className="flex justify-between">
                          <span>Matches Played</span>
                          <span className="font-semibold">{userProfileData.teamInfo.matchesPlayed || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wins</span>
                          <span className="font-semibold text-green-600">{userProfileData.teamInfo.wins || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Losses</span>
                          <span className="font-semibold text-red-600">{userProfileData.teamInfo.losses || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Draws</span>
                          <span className="font-semibold text-blue-600">{userProfileData.teamInfo.draws || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Win Rate</span>
                          <span className="font-semibold text-blue-600">
                            {calculateWinRate(
                              userProfileData.teamInfo.wins || 0,
                              userProfileData.teamInfo.matchesPlayed || 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Clean Sheets</span>
                          <span className="font-semibold text-emerald-600">{userProfileData.teamInfo.clean_sheets || 0}</span>
                        </div>
                        {userProfileData.teamInfo.location && (
                          <div className="flex justify-between">
                            <span>Home Ground</span>
                            <span className="font-semibold">{userProfileData.teamInfo.location}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-500">No team performance data available.</div>
                    )
                  ) : (
                    <>
                      {userProfileData.position && (
                        <div className="flex justify-between">
                          <span>Position</span>
                          <span className="font-semibold">{userProfileData.position}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Matches Played</span>
                        <span className="font-semibold">{userProfileData.matchesPlayed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wins</span>
                        <span className="font-semibold text-green-600">{userProfileData.wins || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Losses</span>
                        <span className="font-semibold text-red-600">{userProfileData.losses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win Rate</span>
                        <span className="font-semibold text-blue-600">
                          {calculateWinRate(userProfileData.wins || 0, userProfileData.matchesPlayed || 0)}
                        </span>
                      </div>
                      {userProfileData.Goals !== undefined && (
                        <div className="flex justify-between">
                          <span>Goals</span>
                          <span className="font-semibold text-orange-600">{userProfileData.Goals}</span>
                        </div>
                      )}
                      {userProfileData.assist !== undefined && (
                        <div className="flex justify-between">
                          <span>Assists</span>
                          <span className="font-semibold text-blue-600">{userProfileData.assist}</span>
                        </div>
                      )}
                      {userProfileData.Saves !== undefined && (
                        <div className="flex justify-between">
                          <span>Saves</span>
                          <span className="font-semibold text-purple-600">{userProfileData.Saves}</span>
                        </div>
                      )}
                      {userProfileData.MVPs !== undefined && (
                        <div className="flex justify-between">
                          <span>MVPs</span>
                          <span className="font-semibold text-amber-600">{userProfileData.MVPs}</span>
                        </div>
                      )}
                      {userProfileData.clean_sheets !== undefined && (
                        <div className="flex justify-between">
                          <span>Clean Sheets</span>
                          <span className="font-semibold text-emerald-600">{userProfileData.clean_sheets}</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {userProfileData.userType === 'team' ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Team Players</h3>
                  {userProfileData.teamInfo?.players && userProfileData.teamInfo.players.length > 0 ? (
                    userProfileData.teamInfo.players.map((player) => (
                      <Card key={player.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <Link href={`/profile/${player.id}`} className="flex items-center gap-4 cursor-pointer">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{player.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-gray-900">{player.name}</div>
                              <div className="text-sm text-gray-600">
                                {player.position}
                                {player.number && ` • #${player.number}`}
                              </div>                              <div className="text-xs text-gray-500">
                                Joined {typeof player.joinDate === 'object' && 'toDate' in player.joinDate 
                                    ? player.joinDate.toDate().toLocaleDateString()
                                    : new Date(player.joinDate as any).toLocaleDateString()}
                              </div>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No players in the team yet.
                    </div>
                  )}
                  
                  {userProfileData.teamInfo?.recruiterInfo?.openPositions && 
                   userProfileData.teamInfo.recruiterInfo.openPositions.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
                      <div className="space-y-2">
                        {userProfileData.teamInfo.recruiterInfo.openPositions.map((position, index) => (
                          <Badge key={index} variant="secondary" className="mr-2">{position}</Badge>
                        ))}
                      </div>
                      {userProfileData.teamInfo.recruiterInfo.requirements && (
                        <div className="mt-4 text-sm text-gray-600">
                          <strong>Requirements:</strong>
                          <ul className="list-disc list-inside mt-2">
                            {userProfileData.teamInfo.recruiterInfo.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                connectionDetails.length > 0 ? (
                  connectionDetails.map((connection) => (
                    <Card key={connection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Link href={`/profile/${connection.id}`} className="flex items-center gap-4 cursor-pointer">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={connection.photoURL || ''} alt={connection.displayName} />
                            <AvatarFallback>{connection.displayName?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">{connection.displayName}</div>
                            <div className="text-sm text-gray-600">{connection.email}</div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No connections yet.
                  </div>
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
