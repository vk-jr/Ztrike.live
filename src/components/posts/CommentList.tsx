'use client';

import { useState } from 'react';
import { Comment } from '@/types/database';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthContext";
import { addComment } from '@/lib/postActions';
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CommentListProps {
  postId: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
}

export default function CommentList({ postId, comments, onCommentAdded }: CommentListProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsLoading(true);
    try {
      const comment = await addComment(postId, user.uid, newComment.trim());
      onCommentAdded(comment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.photoURL || ''} />
          <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={isLoading || !newComment.trim()}
          className="rounded-full"
        >
          {isLoading ? <LoadingSpinner size="small" /> : 'Post'}
        </Button>
      </form>

      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2 items-start">
          <Avatar className="w-6 h-6">
            <AvatarImage src={comment.authorPhotoURL} />
            <AvatarFallback>{comment.authorName?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <Card className="flex-1">
            <CardContent className="p-3">
              <p className="font-semibold text-sm">{comment.authorName || 'Unknown User'}</p>
              <p className="text-sm">{comment.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {/* Assuming createdAt is always a Date object after fetching */}
                {comment.createdAt instanceof Date ? 
                  comment.createdAt.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'Unknown date'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
