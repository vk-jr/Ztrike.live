import { arrayUnion, arrayRemove, doc, updateDoc, increment, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Comment } from '@/types/database';
import { getUserProfile } from './db'; // Import getUserProfile

export const likePost = async (postId: string, userId: string) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) return;
  
  const post = postSnap.data();
  const likedBy = post.likedBy || [];
  
  // Check if user already liked the post
  if (likedBy.includes(userId)) return;
  
  await updateDoc(postRef, {
    'likes': increment(1),
    'likedBy': arrayUnion(userId)
  });
};

export const unlikePost = async (postId: string, userId: string) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) return;
  
  const post = postSnap.data();
  const likedBy = post.likedBy || [];
  
  // Check if user hasn't liked the post
  if (!likedBy.includes(userId)) return;
  
  await updateDoc(postRef, {
    'likes': increment(-1),
    'likedBy': arrayRemove(userId)
  });
};

export const addComment = async (postId: string, userId: string, content: string) => {
  const postRef = doc(db, 'posts', postId);
  
  // Fetch the author's profile to get name and photo
  const authorProfile = await getUserProfile(userId);
  
  const comment: Comment = {
    id: Math.random().toString(36).substring(2), // Simple ID generation
    postId: postId, // Add postId here
    content,
    authorId: userId,
    createdAt: new Date(),
    // Include author name and photo if profile was fetched successfully
    authorName: authorProfile?.displayName,
    authorPhotoURL: authorProfile?.photoURL,
  };
  await updateDoc(postRef, {
    comments: arrayUnion(comment)
  });
  return comment;
};

export const deleteComment = async (postId: string, commentId: string) => {
  const postRef = doc(db, 'posts', postId);
  // First get the post to find the comment to remove
  const post = await getDoc(postRef);
  if (!post.exists()) return;
  
  const postData = post.data();
  const updatedComments = postData.comments.filter(
    (comment: Comment) => comment.id !== commentId
  );
  
  await updateDoc(postRef, {
    comments: updatedComments
  });
};

export const editPost = async (postId: string, content: string) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    content,
    updatedAt: new Date()
  });
};

export const deletePost = async (postId: string) => {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);
};
