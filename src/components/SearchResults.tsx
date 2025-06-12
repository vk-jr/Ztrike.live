'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import type { UserProfile } from '@/types/database';

interface SearchResultsProps {
  results: UserProfile[];
  onResultClick?: () => void;
}

export function SearchResults({ results, onResultClick }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <Card className="absolute top-full w-full mt-1 z-50 max-h-96 overflow-auto">
      <div className="p-2 divide-y">
        {results.map((result) => (
          <Link 
            key={result.id} 
            href={`/profile/${result.id}`} 
            onClick={onResultClick}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={result.photoURL} alt={result.displayName} />
              <AvatarFallback>{result.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{result.displayName}</div>
              {result.userType === 'athlete' && (
                <div className="text-xs text-gray-500">
                  {result.sports?.join(', ')}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
