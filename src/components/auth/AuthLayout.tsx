'use client';

import { AuthProvider } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import ClientBody from '@/app/ClientBody';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        {isAuthPage ? (
          <ClientBody>
            {children}
          </ClientBody>
        ) : (
          <ProtectedRoute>
            <ClientBody>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="pt-16">
                  {children}
                </main>
              </div>
            </ClientBody>
          </ProtectedRoute>
        )}
      </AuthProvider>
    </Suspense>
  );
}
