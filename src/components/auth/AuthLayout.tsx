'use client';

import { AuthProvider } from '@/lib/auth/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import ClientBody from '@/app/ClientBody';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
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
      </AuthProvider>
    </Suspense>
  );
}
