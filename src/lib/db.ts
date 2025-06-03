import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  writeBatch,
  FirestoreError,
  DocumentReference,
  arrayUnion,
  arrayRemove,
  FieldValue,
  documentId
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';
import type { UserProfile, Team, League, Match, Message, Post } from '@/types/database';

// Error handling wrapper
const handleFirestoreError = (error: FirestoreError) => {
  console.error('Firestore operation failed:', error);
  throw new Error(`Database operation failed: ${error.message}`);
};

// Helper function to add timestamps
const addTimestamps = (data: any, isNew = false) => ({
  ...data,
  updatedAt: Timestamp.now(),
  ...(isNew && { createdAt: Timestamp.now() })
});

// Users Collection
export const createUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, addTimestamps(data, true));
    return userId;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // If the profile doesn't exist, try to create it from the Firebase auth user
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const names = firebaseUser.displayName?.split(' ') || ['', ''];
        const newProfile: Partial<UserProfile> = {
          id: userId,
          email: firebaseUser.email || '',
          firstName: names[0],
          lastName: names.slice(1).join(' '),
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          bio: '',
          teams: [],
          leagues: [],
          connections: [],
          pendingRequests: [],
          postViews: 0
        };
        await createUserProfile(userId, newProfile);
        return newProfile as UserProfile;
      }
      return null;
    }

    const data = userSnap.data();
    return {
      ...data,
      id: userSnap.id,
      // Initialize empty arrays if they don't exist
      teams: data.teams || [],
      leagues: data.leagues || [],
      connections: data.connections || [],
      pendingRequests: data.pendingRequests || [],
      postViews: data.postViews || 0,
      // Timestamps already handled by Firestore
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      // Ensure firstName and lastName are included
      firstName: data.firstName || data.displayName?.split(' ')[0] || '',
      lastName: data.lastName || data.displayName?.split(' ').slice(1).join(' ') || ''
    } as UserProfile;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// Teams Collection
export const createTeam = async (data: Partial<Team>, creatorId: string) => {
  try {
    const batch = writeBatch(db);
    const teamRef = doc(collection(db, 'teams'));
    
    const teamData = addTimestamps({
      ...data,
      ownerId: creatorId,
      adminIds: [creatorId],
      wins: 0,
      losses: 0,
      draws: 0
    }, true);
    
    batch.set(teamRef, teamData);
    
    // Update user's teams array
    const userRef = doc(db, 'users', creatorId);
    batch.update(userRef, {
      teams: arrayUnion(teamRef.id),
      updatedAt: Timestamp.now()
    });
    
    await batch.commit();
    return teamRef.id;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
  }
};

export const getTeam = async (teamId: string) => {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  return teamSnap.exists() ? teamSnap.data() as Team : null;
};

export const getUserTeams = async (userId: string) => {
  const teamsRef = collection(db, 'teams');
  const memberPath = 'members.' + userId;
  const q = query(teamsRef, where(memberPath, 'in', ['owner', 'admin', 'player']));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Team[];
};

// Leagues Collection
export const createLeague = async (data: Partial<League>, creatorId: string) => {
  try {
    const batch = writeBatch(db);
    const leagueRef = doc(collection(db, 'leagues'));
    
    const leagueData = addTimestamps({
      ...data,
      ownerId: creatorId,
      adminIds: [creatorId],
      teamIds: [],
      status: 'active'
    }, true);
    
    batch.set(leagueRef, leagueData);
    
    // Update user's leagues array
    const userRef = doc(db, 'users', creatorId);
    batch.update(userRef, {
      leagues: arrayUnion(leagueRef.id),
      updatedAt: Timestamp.now()
    });
    
    await batch.commit();
    return leagueRef.id;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
  }
};

export const getLeague = async (leagueId: string) => {
  const leagueRef = doc(db, 'leagues', leagueId);
  const leagueSnap = await getDoc(leagueRef);
  return leagueSnap.exists() ? leagueSnap.data() as League : null;
};

export const getUserLeagues = async (userId: string) => {
  const leaguesRef = collection(db, 'leagues');
  const q = query(leaguesRef, where('members', 'array-contains', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as League[];
};

// Matches Collection
export const createMatch = async (data: Partial<Match> & { teamIds: string[] }, creatorId: string) => {
  try {
    const batch = writeBatch(db);
    const matchRef = doc(collection(db, 'matches'));
    
    const matchData = addTimestamps({
      ...data,
      creatorId,
      status: 'scheduled',
      score: { home: 0, away: 0 }
    }, true);
    
    batch.set(matchRef, matchData);
    
    // Update team match arrays
    if (data.teamIds?.length === 2) {
      const [homeTeamRef, awayTeamRef] = data.teamIds.map((id: string) => doc(db, 'teams', id));
      batch.update(homeTeamRef, {
        matches: arrayUnion(matchRef.id),
        updatedAt: Timestamp.now()
      });
      batch.update(awayTeamRef, {
        matches: arrayUnion(matchRef.id),
        updatedAt: Timestamp.now()
      });
    }
    
    await batch.commit();
    return matchRef.id;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
  }
};

export const getMatch = async (matchId: string) => {
  const matchRef = doc(db, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);
  return matchSnap.exists() ? matchSnap.data() as Match : null;
};

export const getTeamMatches = async (teamId: string) => {
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('teamIds', 'array-contains', teamId),
    orderBy('startTime', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[];
};

// Messages Collection
export const createMessage = async (data: Partial<Message>) => {
  const messageRef = doc(collection(db, 'messages'));
  await setDoc(messageRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return messageRef.id;
};

export const getMessage = async (messageId: string) => {
  const messageRef = doc(db, 'messages', messageId);
  const messageSnap = await getDoc(messageRef);
  return messageSnap.exists() ? messageSnap.data() as Message : null;
};

// Messages Collection with pagination
export const getUserMessages = async (userId: string, pageSize = 20, lastDoc?: DocumentReference) => {
  try {
    const messagesRef = collection(db, 'messages');
    const constraints: QueryConstraint[] = [
      where('participantIds', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    ];
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    constraints.push(limit(pageSize));
    const q = query(messagesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return {
      messages: querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Message[],
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
  }
};

// Connections functions
export const createConnection = async (userId: string, targetUserId: string) => {
  try {
    const batch = writeBatch(db);
    
    // Add connection to current user's connections
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      connections: arrayUnion(targetUserId),
      updatedAt: Timestamp.now()
    });
    
    // Add connection to target user's connections
    const targetUserRef = doc(db, 'users', targetUserId);
    batch.update(targetUserRef, {
      connections: arrayUnion(userId),
      updatedAt: Timestamp.now()
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return false;
  }
};

// Posts Collection
export const createPost = async (data: {
  content: string;
  imageUrl?: string;
  authorId: string;
  createdAt: Date;
  likes: number;
  comments: any[];
}) => {
  try {
    const batch = writeBatch(db);
    const postRef = doc(collection(db, 'posts'));
    
    const postData = {
      ...data,
      createdAt: Timestamp.fromDate(data.createdAt),
      updatedAt: Timestamp.now()
    };
    
    batch.set(postRef, postData);
    
    // Update user's posts array
    const userRef = doc(db, 'users', data.authorId);
    batch.update(userRef, {
      posts: arrayUnion(postRef.id),
      updatedAt: Timestamp.now()
    });
    
    await batch.commit();
    return postRef.id;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
  }
};

export const getPost = async (postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    return postSnap.exists() ? { id: postSnap.id, ...postSnap.data() } : null;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20) // Limit to 20 posts at a time for better performance
    );
    const querySnapshot = await getDocs(q);
    
    // Get user info for the posts
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      authorName: userData?.displayName || 'Unknown User',
      authorPhotoURL: userData?.photoURL,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt,
      likes: doc.data().likes || 0,
      comments: doc.data().comments || []
    })) as Post[];
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return [];
  }
};

export const getNetworkPosts = async (userId: string): Promise<Post[]> => {
  try {
    // First get the user's connections
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const connections = userData?.connections || [];

    // If user has no connections, return empty array
    if (connections.length === 0) {
      return [];
    }

    // Get posts from connections
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('authorId', 'in', [...connections, userId]), // Include user's own posts
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    
    // Get all unique user IDs from posts
    const userIds = [...new Set(querySnapshot.docs.map(doc => doc.data().authorId))];
    
    // Get user information for all authors in a single batch
    const userRefs = userIds.map(uid => doc(db, 'users', uid));
    const userSnaps = await Promise.all(userRefs.map(ref => getDoc(ref)));
    const userDataMap = Object.fromEntries(
      userSnaps.map(snap => [snap.id, snap.data()])
    );    // Map posts with author information
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        likes: data.likes || 0,
        comments: data.comments || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        authorName: userDataMap[data.authorId]?.displayName || 'Unknown User',
        authorPhotoURL: userDataMap[data.authorId]?.photoURL
      } as Post;
    });
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
  }
  return [];
};

export const getSuggestedUsers = async (userId: string, limitCount = 5): Promise<UserProfile[]> => {
  try {
    // Get current user's connections
    const userSnap = await getDoc(doc(db, 'users', userId));
    const userData = userSnap.data() as UserProfile;
    const userConnections = userData?.connections || [];
    const excludeIds = [userId, ...userConnections];

    // Get users who are not connected to the current user
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where(documentId(), 'not-in', excludeIds),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      } as UserProfile));
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return [];
  }
};

// Connection Request functions
export const createConnectionRequest = async (fromUserId: string, toUserId: string) => {
  try {
    console.log('Creating connection request:', { fromUserId, toUserId });
    // First check if the request already exists
    const targetUserRef = doc(db, 'users', toUserId);
    const targetUserSnap = await getDoc(targetUserRef);
    if (!targetUserSnap.exists()) {
      console.error('Target user does not exist:', toUserId);
      return false;
    }
    const targetUserData = targetUserSnap.data();
    const pendingRequests = targetUserData?.pendingRequests || [];
    if (pendingRequests.includes(fromUserId)) {
      console.log('Connection request already exists');
      return true;
    }
    // Check if users are already connected
    const fromUserRef = doc(db, 'users', fromUserId);
    const fromUserSnap = await getDoc(fromUserRef);
    if (!fromUserSnap.exists()) {
      console.error('From user does not exist:', fromUserId);
      return false;
    }
    const fromUserData = fromUserSnap.data();
    const connections = fromUserData?.connections || [];
    if (connections.includes(toUserId)) {
      console.log('Users are already connected');
      return true;
    }
    const batch = writeBatch(db);
    // If pendingRequests does not exist, set it with merge:true, else update
    if (!targetUserData?.pendingRequests) {
      batch.set(targetUserRef, {
        pendingRequests: [fromUserId],
        updatedAt: Timestamp.now()
      }, { merge: true });
    } else {
      batch.update(targetUserRef, {
        pendingRequests: arrayUnion(fromUserId),
        updatedAt: Timestamp.now()
      });
    }
    await batch.commit();
    console.log('Connection request created successfully');
    return true;
  } catch (error) {
    console.error('Error in createConnectionRequest:', error);
    handleFirestoreError(error as FirestoreError);
    return false;
  }
};

export const acceptConnectionRequest = async (userId: string, fromUserId: string) => {
  try {
    const batch = writeBatch(db);
    
    // Add connection to both users
    const userRef = doc(db, 'users', userId);
    const fromUserRef = doc(db, 'users', fromUserId);
    
    batch.update(userRef, {
      connections: arrayUnion(fromUserId),
      pendingRequests: arrayRemove(fromUserId),
      updatedAt: Timestamp.now()
    });
    
    batch.update(fromUserRef, {
      connections: arrayUnion(userId),
      updatedAt: Timestamp.now()
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return false;
  }
};

export const rejectConnectionRequest = async (userId: string, fromUserId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pendingRequests: arrayRemove(fromUserId),
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return false;
  }
};

export const getPendingRequests = async (userId: string): Promise<UserProfile[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const pendingRequestIds = userData?.pendingRequests || [];

    if (pendingRequestIds.length === 0) {
      return [];
    }

    const userRefs = pendingRequestIds.map((uid: string) => doc(db, 'users', uid));
    const userSnaps = await Promise.all(userRefs.map((ref: DocumentReference) => getDoc(ref)));
    
    return userSnaps
      .filter(snap => snap.exists())
      .map(snap => ({ 
        id: snap.id, 
        ...snap.data(),
        createdAt: snap.data().createdAt.toDate(),
        updatedAt: snap.data().updatedAt.toDate()
      } as UserProfile));
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return [];
  }
};

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    
    // Get all unique user IDs from posts
    const userIds = [...new Set(querySnapshot.docs.map(doc => doc.data().authorId))];
    
    // Get user information for all authors in a single batch
    const userRefs = userIds.map(uid => doc(db, 'users', uid));
    const userSnaps = await Promise.all(userRefs.map(ref => getDoc(ref)));
    const userDataMap = Object.fromEntries(
      userSnaps.map(snap => [snap.id, snap.data()])
    );

    // Map posts with author information
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        likes: data.likes || 0,
        comments: data.comments || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        authorName: userDataMap[data.authorId]?.displayName || 'Unknown User',
        authorPhotoURL: userDataMap[data.authorId]?.photoURL
      } as Post;
    });
  } catch (error) {
    handleFirestoreError(error as FirestoreError);
    return [];
  }
};
