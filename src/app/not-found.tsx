'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-6">The page you are looking for does not exist.</p>
      <Link href="/" passHref>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Go back home
        </button>
      </Link>
    </div>
  );
} 