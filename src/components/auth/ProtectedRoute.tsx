'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const publicPaths = ['/', '/sign-in', '/sign-up'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // If no user and trying to access protected route, redirect to sign-in
      if (!user && !publicPaths.includes(pathname)) {
        router.push('/sign-in');
        return;
      }
      // If user is signed in and trying to access auth pages, redirect to profile
      if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
        router.push('/profile');
        return;
      }
      // If user is not signed in and on homepage, redirect to sign-in
      if (!user && pathname === '/') {
        router.push('/sign-in');
        return;
      }
      setIsAuthorized(true);
    }
  }, [user, loading, pathname, router]);

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
