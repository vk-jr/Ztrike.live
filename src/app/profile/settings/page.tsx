"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserProfile, updateUserProfile } from "@/lib/db";
import type { UserProfile } from "@/types/database";
import { toast } from "@/components/ui/use-toast";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { ImagePlus } from "lucide-react";

interface FormDataType {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  currentTeam: string;
  photoURL: string;
  bannerURL: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    displayName: "",
    bio: "",
    currentTeam: "",
    photoURL: "",
    bannerURL: ""
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setFormData({
              firstName: profile.firstName || "",
              lastName: profile.lastName || "",
              displayName: profile.displayName || "",
              bio: profile.bio || "",
              currentTeam: profile.currentTeam || "",
              photoURL: profile.photoURL || "",
              bannerURL: profile.bannerURL || ""
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB for banner, 2MB for photo)
    const maxSize = type === 'banner' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Delete old file if exists
      const oldUrl = type === 'photo' ? formData.photoURL : formData.bannerURL;
      if (oldUrl) {
        try {
          const oldFileRef = ref(storage, oldUrl);
          await deleteObject(oldFileRef);
        } catch (error) {
          console.error(`Error deleting old ${type}:`, error);
        }
      }

      // Upload new file
      const folderPath = type === 'photo' ? 'profiles' : 'banners';
      const storageRef = ref(storage, `${folderPath}/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update form data
      setFormData(prev => ({
        ...prev,
        [type === 'photo' ? 'photoURL' : 'bannerURL']: downloadURL
      }));

      toast({
        title: "Success",
        description: `${type === 'photo' ? 'Profile photo' : 'Banner'} uploaded successfully`
      });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to upload ${type === 'photo' ? 'profile photo' : 'banner'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        bio: formData.bio,
        currentTeam: formData.currentTeam,
        photoURL: formData.photoURL,
        bannerURL: formData.bannerURL
      });

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.photoURL} />
                <AvatarFallback>{formData.displayName?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e, 'photo')}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Uploading..." : "Upload Photo"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Display Name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">Bio</label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="currentTeam" className="text-sm font-medium">Current Team</label>
              <Input
                id="currentTeam"
                name="currentTeam"
                value={formData.currentTeam}
                onChange={handleInputChange}
                placeholder="Current Team"
              />
            </div>            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="banner" className="text-sm font-medium">Banner Image</label>
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={(e) => handleFileSelect(e, 'banner')}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Uploading..." : "Upload Banner"}
                </Button>
              </div>
              
              {/* Banner Preview */}
              <div className="relative w-full h-[120px] rounded-lg overflow-hidden bg-gray-100">
                {formData.bannerURL ? (
                  <img 
                    src={formData.bannerURL} 
                    alt="Banner Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm">
                    No banner image set
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}