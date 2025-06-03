'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, Send, X, Video } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { createPost } from "@/lib/db";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function PostCreate() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      setFileType(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content.trim() && !file)) return;

    setIsLoading(true);
    try {
      let fileUrl = '';
      if (file) {
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(snapshot.ref);
      }

      await createPost({
        content: content.trim(),
        imageUrl: fileUrl,
        authorId: user.uid,
        createdAt: new Date(),
        likes: 0,
        comments: []
      });

      setContent('');
      setFile(null);
      setFilePreview(null);
      setFileType(null);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4 items-start">
            <Avatar className="mt-1">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none border rounded-lg p-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          {filePreview && fileType === 'image' && (
            <div className="relative">
              <img 
                src={filePreview} 
                alt="Preview" 
                className="max-h-60 rounded-lg object-cover mx-auto"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFilePreview(null);
                  setFileType(null);
                }}
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
              >
                ×
              </button>
            </div>
          )}
          {filePreview && fileType === 'video' && (
            <div className="relative">
              <video controls className="max-h-60 rounded-lg object-cover mx-auto">
                <source src={filePreview} />
                Your browser does not support the video tag.
              </video>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFilePreview(null);
                  setFileType(null);
                }}
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFileType('image');
                  fileInputRef.current?.setAttribute('accept', 'image/*');
                  fileInputRef.current?.click();
                }}
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFileType('video');
                  fileInputRef.current?.setAttribute('accept', 'video/*');
                  fileInputRef.current?.click();
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                Add Video
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={e => handleFileSelect(e, fileType!)}
                accept={fileType === 'image' ? 'image/*' : fileType === 'video' ? 'video/*' : ''}
                className="hidden"
              />
            </div>
            <Button type="submit" disabled={isLoading || (!content.trim() && !file)} className="ml-auto">
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
