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

export default function AthleteTeamInfoPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  const [isInTeam, setIsInTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [leagueName, setLeagueName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is not logged in or not an athlete
  // useEffect(() => {
  //   if (!loading && (!userProfile || userProfile.accountType !== 'athlete')) {
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
        applicantType: 'player', // Assuming 'player' is the type for athletes
        status: 'pending',
        createdAt: new Date(),
        // Include team and league info only if the athlete is in a team
        ...(isInTeam && { targetTeamName: teamName, targetLeagueName: leagueName }),
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

  // if (loading || !userProfile || userProfile.accountType !== 'athlete') {
  //   return <div>Loading...</div>; // Or a loading spinner
  // }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Tell us about your team</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Help us connect you with the right opportunities.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inTeam" className="text-base">Are you currently in a team?</Label>
            <div className="flex items-center space-x-4">
              <Button 
                variant={isInTeam ? 'default' : 'outline'}
                onClick={() => setIsInTeam(true)}
                className={`flex-1 ${isInTeam ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Yes
              </Button>
              <Button 
                variant={!isInTeam ? 'default' : 'outline'}
                onClick={() => setIsInTeam(false)}
                className={`flex-1 ${!isInTeam ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                No
              </Button>
            </div>
          </div>

          {isInTeam && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input 
                  id="teamName" 
                  value={teamName} 
                  onChange={(e) => setTeamName(e.target.value)} 
                  placeholder="Enter your team name"
                  className="w-full"
                />
                {/* TODO: Implement team search/selection */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="leagueName">League Name</Label>
                <Input 
                  id="leagueName" 
                  value={leagueName} 
                  onChange={(e) => setLeagueName(e.target.value)} 
                  placeholder="Enter your league name"
                   className="w-full"
                />
                 {/* TODO: Implement league search/selection */}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
