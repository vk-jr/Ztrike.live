'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { createUserProfile } from '@/lib/db';
import { UserCredential, User } from 'firebase/auth';
import type { UserProfile } from '@/types/database';

// Common sports list
const COMMON_SPORTS = [
  'Soccer', 'Basketball', 'Baseball', 'Tennis',
  'Cricket', 'Volleyball', 'Hockey', 'Rugby', 'Others'
];

// Social media platforms
const SPORTS_PLATFORMS = [
  'Instagram', 'Twitter', 'Facebook', 'YouTube', 'TikTok', 'Strava'
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type ValidationErrors = Partial<Record<keyof FormData, string>>;

export function SignUp() {  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showSportsForm, setShowSportsForm] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState('');
  const [sportsAccounts, setSportsAccounts] = useState<{ [key: string]: string }>({});
  const [tempUserData, setTempUserData] = useState<User | null>(null);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const errors: ValidationErrors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and numbers';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };  const createProfile = async (user: User, displayName?: string) => {
    const profile: Partial<UserProfile> = {
      id: user.uid,
      email: user.email || '',
      firstName: formData.firstName,
      lastName: formData.lastName,
      displayName: displayName || user.displayName || `${formData.firstName} ${formData.lastName}`,
      photoURL: user.photoURL || '',
      bio: '',
      teams: [],
      leagues: [],
      connections: [],
      pendingRequests: [],
      sentRequests: [],
      postViews: 0,
      sports: selectedSports,
      currentTeam: currentTeam || undefined,
      sportsAccounts: Object.keys(sportsAccounts).length > 0 ? sportsAccounts : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await createUserProfile(user.uid, profile);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signUp(formData.email, formData.password);
      const { user } = userCredential;
      setTempUserData(user);
      setShowSportsForm(true);
    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      const { user } = result;
      if (user) {
        setTempUserData(user);
        setShowSportsForm(true);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setError(error?.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof FormData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (showSportsForm && tempUserData) {
    return (
      <Card className="w-full max-w-md p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center">Tell us about your sports</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select sports you play</label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_SPORTS.map((sport) => (
                <label key={sport} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(sport)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSports([...selectedSports, sport]);
                      } else {
                        setSelectedSports(selectedSports.filter(s => s !== sport));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{sport}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Current Team (if any)</label>
            <Input
              type="text"
              placeholder="Enter your current team name"
              value={currentTeam}
              onChange={(e) => setCurrentTeam(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Sports Social Media Accounts</label>
            {SPORTS_PLATFORMS.map((platform) => (
              <Input
                key={platform}
                type="text"
                placeholder={`${platform} username (optional)`}
                value={sportsAccounts[platform] || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setSportsAccounts({ ...sportsAccounts, [platform]: e.target.value });
                  } else {
                    const newAccounts = { ...sportsAccounts };
                    delete newAccounts[platform];
                    setSportsAccounts(newAccounts);
                  }
                }}
              />
            ))}
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await createProfile(
                  tempUserData,
                  `${formData.firstName} ${formData.lastName}`
                );
                router.push('/profile');
              } catch (error: any) {
                console.error('Error updating profile:', error);
                setError(error?.message || 'Failed to update profile. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Completing signup...' : 'Complete Profile'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Create your ZTRIKE Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full"
            />
            {validationErrors.firstName && (
              <div className="text-xs text-red-500">{validationErrors.firstName}</div>
            )}
          </div>
          <div className="space-y-2">
            <Input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full"
            />
            {validationErrors.lastName && (
              <div className="text-xs text-red-500">{validationErrors.lastName}</div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full"
          />
          {validationErrors.email && (
            <div className="text-xs text-red-500">{validationErrors.email}</div>
          )}
        </div>
        <div className="space-y-2">
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full"
          />
          {validationErrors.password && (
            <div className="text-xs text-red-500">{validationErrors.password}</div>
          )}
          <div className="text-xs text-gray-500">
            Password must be at least 8 characters and contain uppercase, lowercase, and numbers
          </div>
        </div>
        <div className="space-y-2">
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full"
          />
          {validationErrors.confirmPassword && (
            <div className="text-xs text-red-500">{validationErrors.confirmPassword}</div>
          )}
        </div>
        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 bg-white text-gray-500">or continue with</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
          <path
            fill="currentColor"
            d="M12 23c4.97 0 9.13-3.65 9.98-8.45H12V9.08h9.98C22.13 3.65 17.97 0 12 0 5.37 0 0 5.37 0 12s5.37 12 12 12z"
          />
        </svg>
        Continue with Google
      </Button>
    </Card>
  );
}
