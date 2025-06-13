import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  FirestoreError,
  arrayUnion,
  DocumentData,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Notification, NotificationType } from '@/types/notification';
import type { UserProfile } from '@/types/database';

// Helper to handle Firestore errors
const handleFirestoreError = (error: FirestoreError) => {
  console.error('Firestore operation failed:', error);
  throw new Error(`Database operation failed: ${error.message}`);
};

// Create a new notification
export const createNotification = async (data: {
  type: NotificationType;
  userId: string;
  fromId: string;
  title: string;
  description: string;
  metadata?: {
    messageId?: string;
  };
}) => {
  try {    const notificationRef = doc(collection(db, `users/${data.userId}/notifications`));
    const notificationData = {
      ...data,
      id: notificationRef.id,
      read: false,
      createdAt: Timestamp.now()
    };

    await setDoc(notificationRef, notificationData);
    return notificationRef.id;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return null;
  }
};

// Get user's notifications with user details
export const getUserNotifications = async (userId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');    const q = query(
      collection(db, `users/${userId}/notifications`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    
    // Get all unique user IDs from notifications
    const userIds = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      userIds.add(data.fromId);
    });

    // Fetch all user profiles in parallel
    const userProfiles = new Map<string, DocumentData>();
    await Promise.all(
      Array.from(userIds).map(async (id) => {
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userProfiles.set(id, userSnap.data());
        }
      })
    );

    // Map notifications with user details
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const fromUser = userProfiles.get(data.fromId) as UserProfile | undefined;
      return {
        ...data,
        id: doc.id,
        fromUser: fromUser ? {
          id: data.fromId,
          displayName: fromUser.displayName,
          photoURL: fromUser.photoURL
        } : null
      } as Notification & { fromUser: { id: string; displayName: string; photoURL?: string; } | null };
    });
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  try {
    const notificationRef = doc(db, `users/${userId}/notifications`, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsRef = collection(db, `users/${userId}/notifications`);
    const q = query(notificationsRef, where('read', '==', false));
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        updatedAt: Timestamp.now()
      });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return false;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const notificationsRef = collection(db, `users/${userId}/notifications`);
    const q = query(notificationsRef, where('read', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return 0;
  }
};
