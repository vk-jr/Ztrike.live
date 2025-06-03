'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserPosts, getNetworkPosts, getAllPosts } from '@/lib/db';
import type { Post } from '@/types/database';
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PostDisplayProps {
  userId: string;
  showNetworkPosts?: boolean;
  showAllPosts?: boolean;
}

export default function PostDisplay({ userId, showNetworkPosts = false, showAllPosts = false }: PostDisplayProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [userId, showNetworkPosts]);

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
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center space-x-4 p-4">
            <Avatar>
              <AvatarImage src={post.authorPhotoURL} />
              <AvatarFallback>{post.authorName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.authorName}</p>              <p className="text-sm text-gray-500">
                {post.createdAt?.toDate ? 
                  post.createdAt.toDate().toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'Unknown date'}
              </p>
            </div>
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
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                {post.likes || 0}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                {post.comments?.length || 0}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
