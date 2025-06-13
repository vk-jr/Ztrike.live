'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: ('athlete' | 'team' | 'league')[];
}

const publicPaths = ['/', '/sign-in', '/sign-up'];

export function ProtectedRoute({ children, allowedTypes }: ProtectedRouteProps) {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Handle non-authenticated users
      if (!user && !publicPaths.includes(pathname ?? '')) {
        router.push('/sign-in');
        return;
      }

      // Handle user type specific access
      if (userProfile && allowedTypes) {
        // Type assertion to allow 'undefined' or 'player' to be passed to includes for the purpose of the check.
        // The subsequent switch statement handles the actual routing logic for different user types.
        if (!allowedTypes.includes(userProfile.userType as 'team' | 'athlete' | 'league')) {
          // Redirect based on user type
          switch (userProfile.userType) {
            case 'team':
              router.push('/teams/dashboard');
              break;
            case 'athlete':
              router.push('/profile');
              break;
            case 'league':
              router.push('/leagues/dashboard');
              break;
            case 'player': // Added this case to explicitly handle 'player' if it should redirect to '/profile'
              router.push('/profile');
              break;
            default: // This will catch 'undefined' userType and any other unexpected values
              router.push('/profile');
              break;
          }
          return;
        }
      }

      // Handle unauthorized access to type-specific routes
      if (userProfile) {
        // Team dashboard and profile protection
        if ((pathname ?? '').startsWith('/teams/')) {
          const isTeamPath = (pathname ?? '').startsWith('/teams/dashboard');
          const isTeamProfilePath = /^\/teams\/[^/]+$/.test(pathname ?? '');

          if (isTeamPath && userProfile.userType !== 'team') {
            router.push('/profile');
            return;
          }

          if (isTeamProfilePath) {
            const teamId = (pathname ?? '').split('/')[2];
            if (userProfile.userType === 'team' && user?.uid !== teamId) {
              router.push('/teams/dashboard');
              return;
            }
          }
        }

        // League dashboard protection
        if ((pathname ?? '').startsWith('/leagues/dashboard') && userProfile.userType !== 'league') {
          router.push('/profile');
          return;
        }
      }
    }

    setIsAuthorized(true);
  }, [user, loading, userProfile, router, pathname, allowedTypes]);

  // Show nothing while loading or until authorization is determined
  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
