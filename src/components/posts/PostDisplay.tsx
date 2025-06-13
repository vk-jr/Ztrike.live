'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserPosts, getNetworkPosts, getAllPosts } from '@/lib/db';
import { likePost, unlikePost, editPost, deletePost } from '@/lib/postActions';
import type { Post, Comment } from '@/types/database';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/lib/auth/AuthContext";
import CommentList from './CommentList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface PostDisplayProps {
  userId: string;
  showNetworkPosts?: boolean;
  showAllPosts?: boolean;
}

export default function PostDisplay({ userId, showNetworkPosts = false, showAllPosts = false }: PostDisplayProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<{ id: string; content: string } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = async () => {
    if (!editingPost) return;
    try {
      await editPost(editingPost.id, editingPost.content);
      setPosts(posts.map(post => 
        post.id === editingPost.id 
          ? { ...post, content: editingPost.content } 
          : post
      ));
      setIsEditDialogOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    try {
      if (isLiked) {
        await unlikePost(postId, user.uid);
      } else {
        await likePost(postId, user.uid);
      }
      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedBy: isLiked 
              ? post.likedBy.filter((id: string) => id !== user.uid)
              : [...(post.likedBy || []), user.uid]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleCommentAdded = (postId: string, newComment: Comment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId && !showAllPosts) return;
      
      try {
        setLoading(true);
        setError(null);
        let fetchedPosts;
        if (showAllPosts) {
          fetchedPosts = await getAllPosts();
        } else {
          fetchedPosts = showNetworkPosts ?
            await getNetworkPosts(userId) :
            await getUserPosts(userId);
        }
        if (fetchedPosts) {
          setPosts(fetchedPosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId, showNetworkPosts, showAllPosts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!posts.length) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p>Create your first post to share with your network!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editingPost?.content || ''}
            onChange={(e) => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : null)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {posts.map((post) => {
        console.log('Debug Post:', post);
        return (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <Link href={`/profile/${post.authorId}`} className="flex items-center space-x-4 cursor-pointer">
                <Avatar>
                  <AvatarImage src={post.authorPhotoURL} />
                  <AvatarFallback>{post.authorName?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.authorName}</p>
                  <p className="text-sm text-gray-500">
                    {post.createdAt ? 
                      (typeof post.createdAt === 'object' && 'toDate' in post.createdAt
                        ? post.createdAt.toDate().toLocaleString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                          })
                        : new Date(post.createdAt).toLocaleString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                          }))
                    : 'N/A'}
                  </p>
                </div>
              </Link>
              {user?.uid === post.authorId && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPost({ id: post.id, content: post.content });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
              {post.imageUrl && (
                <div className="relative w-full mb-4">
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="rounded-lg object-cover w-full max-h-[500px]"
                  />
                </div>
              )}
              <div className="flex items-center space-x-4 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id, post.likedBy?.includes(user?.uid || ''))}
                  className={post.likedBy?.includes(user?.uid || '') ? 'text-red-500' : ''}
                >
                  <Heart 
                    className={`w-4 h-4 mr-2 ${post.likedBy?.includes(user?.uid || '') ? 'fill-current' : ''}`} 
                  />
                  {post.likes || 0}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {post.comments?.length || 0}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              {expandedComments.includes(post.id) && (
                <div className="mt-4 border-t pt-4">
                  <CommentList
                    postId={post.id}
                    comments={post.comments || []}
                    onCommentAdded={(comment) => handleCommentAdded(post.id, comment)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
