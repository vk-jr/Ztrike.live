'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeamLeagueInfoPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  const [leagueName, setLeagueName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is not logged in or not a team
  // useEffect(() => {
  //   if (!loading && (!userProfile || userProfile.accountType !== 'team')) {
  //     router.push('/'); // Redirect to home or a different page
  //   }
  // }, [userProfile, loading, router]);

  const handleSubmit = async () => {
    if (!userProfile) {
      setError('User not logged in.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const applicationData = {
        applicantId: userProfile.id,
        applicantType: 'team', // Assuming 'team' is the type for teams
        status: 'pending',
        createdAt: new Date(),
        targetLeagueName: leagueName,
      };

      await addDoc(collection(db, 'applications'), applicationData);

      // TODO: Update user profile to indicate onboarding step completed
      // For now, just redirect
      alert('Application submitted!');
      router.push('/'); // Redirect to home or dashboard after submission

    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // if (loading || !userProfile || userProfile.accountType !== 'team') {
  //   return <div>Loading...</div>; // Or a loading spinner
  // }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Tell us about your league</CardTitle>
           <p className="text-sm text-gray-600 mt-1">Help us get your team set up in the right league.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="leagueName" className="text-base">League Name</Label>
            <Input 
              id="leagueName" 
              value={leagueName} 
              onChange={(e) => setLeagueName(e.target.value)} 
              placeholder="Enter your league name"
              className="w-full"
            />
             {/* TODO: Implement league search/selection */}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
