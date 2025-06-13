import { Users, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { getSuggestedUsers, createConnectionRequest } from "@/lib/db";
import type { UserProfile } from "@/types/database";
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import Link from "next/link";

interface PeopleYouMayKnowProps {
  className?: string;
}

export default function PeopleYouMayKnow({ className = "" }: PeopleYouMayKnowProps) {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requestedUsers, setRequestedUsers] = useState<Set<string>>(new Set());

  const loadSuggestedUsers = async () => {
    if (!user) return;
    
    try {
      console.log('Loading suggested users for:', user.uid);
      const users = await getSuggestedUsers(user.uid);
      console.log('Loaded suggested users:', users);
      setSuggestedUsers(users);
    } catch (error) {
      console.error('Error loading suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSuggestedUsers();
    }
  }, [user, loadSuggestedUsers]);

  const handleConnect = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      setRequesting(targetUserId);
      
      if (!user.uid || !targetUserId) {
        console.error('Missing user IDs:', { userId: user.uid, targetUserId });
        return;
      }
      
      console.log('Sending connection request from:', user.uid, 'to:', targetUserId);      const success = await createConnectionRequest(user.uid, targetUserId);
      console.log('Connection request result:', success);
      
      if (success) {
        setRequestedUsers(prev => new Set([...prev, targetUserId]));
        // Remove the user from suggested users
        setSuggestedUsers(prev => prev.filter(user => user.id !== targetUserId));
        
        // Dispatch event to update pending requests in Network page
        window.dispatchEvent(new CustomEvent('connectionRequestSent'));
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setRequesting(null);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestedUsers.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No suggestions available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          People You May Know
        </CardTitle>
      </CardHeader>
      <CardContent>        <div className="divide-y">
          {suggestedUsers.map((suggestedUser) => (<div key={suggestedUser.id} className="flex items-center justify-between px-4 py-3">
              <Link href={`/profile/${suggestedUser.id}`} className="flex items-center gap-3 flex-1 min-w-0 pr-4 cursor-pointer">
                <Avatar>
                  <AvatarImage src={suggestedUser.photoURL || undefined} alt={suggestedUser.displayName || 'User'} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {suggestedUser.displayName?.charAt(0) || suggestedUser.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{suggestedUser.displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{suggestedUser.email}</p>
                </div>
              </Link>
              <Button                variant="outline"
                size="sm"
                onClick={() => handleConnect(suggestedUser.id)}
                disabled={requesting === suggestedUser.id || requestedUsers.has(suggestedUser.id)}
                className="flex items-center gap-2 min-w-[100px] justify-center ml-2"
              >
                {requesting === suggestedUser.id ? (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Sending...
                  </>
                ) : requestedUsers.has(suggestedUser.id) ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Requested
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 