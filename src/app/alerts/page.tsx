"use client";

import { useEffect, useState } from "react";
import { Bell, X, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/notificationActions";
import type { Notification } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface EnhancedNotification extends Notification {
  fromUser: {
    id: string;
    displayName: string;
    photoURL?: string;
  } | null;  avatar?: string; // For backwards compatibility
  link?: string;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userNotifications = await getUserNotifications(user.uid);
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const handleNotificationClick = async (notification: EnhancedNotification) => {
    // Mark the notification as read
    if (!user) return;
    await markNotificationAsRead(user.uid, notification.id);
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate based on notification type
    if (notification.type === 'message') {
      router.push('/messages');
    } else if (notification.type === 'connection_request' || notification.type === 'connection_accepted') {
      router.push(`/profile/${notification.fromId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.uid);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const getNotificationStyle = (type: string, read: boolean) => {
    const baseStyle = read ? 'bg-white border-gray-200' : 'border-blue-200';
    switch (type) {
      case 'connection_request':
        return read ? baseStyle : 'bg-purple-50 border-purple-200';
      case 'connection_accepted':
        return read ? baseStyle : 'bg-green-50 border-green-200';
      case 'message':
        return read ? baseStyle : 'bg-blue-50 border-blue-200';
      default:
        return baseStyle;
    }
  };

  const getNotificationIcon = (notification: EnhancedNotification) => {
    switch (notification.type) {
      case 'connection_request':
      case 'connection_accepted':
        return <Users className="h-5 w-5 text-purple-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-gray-600">Stay updated with connection requests and messages</p>
        </div>

        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleMarkAllAsRead}
        >
          <X className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No notifications yet</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${getNotificationStyle(notification.type, notification.read)} hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.fromUser?.photoURL} />
                      <AvatarFallback>
                        {notification.fromUser?.displayName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                      {getNotificationIcon(notification)}
                    </div>
                  </div>                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      <Link href={notification.link || "#"} className="hover:underline">
                        {notification.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(
                          new Date(notification.createdAt instanceof Date ? 
                            notification.createdAt : 
                            notification.createdAt.toDate()
                          ), 
                          { addSuffix: true }
                        )}
                      </span>
                      {!notification.read && (
                        <Badge variant="default" className="bg-blue-600">New</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
