import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserNotifications } from '@/lib/notificationActions';
import { useAuth } from '@/lib/auth/AuthContext';

export function useNotificationCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    const notifications = await getUserNotifications(user.uid);
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchUnreadCount();

    // Subscribe to notifications collection
    const userNotificationsQuery = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userNotificationsQuery, () => {
      fetchUnreadCount();
    });

    return () => unsubscribe();
  }, [user, fetchUnreadCount]);

  return unreadCount;
}
