'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface PlayerFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  onSportChange?: (sport: string) => void;
  selectedSport?: string;
}

const SPORTS = ['All', 'Football', 'Cricket', 'Basketball', 'Hockey'];

export function PlayerFilters({ onSearch, onFilterChange, onSportChange, selectedSport = 'All' }: PlayerFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search players by name, position, or skills..."
          className="pl-10 w-full"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Sport Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SPORTS.map((sport) => (
          <Button
            key={sport}
            variant={selectedSport === sport ? "default" : "outline"}
            className={`rounded-full ${
              selectedSport === sport 
                ? "bg-blue-600 text-white" 
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => onSportChange?.(sport)}
          >
            {sport}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => onFilterChange({
            status: 'available',
            experience: 'all',
            achievements: false
          })}
        >
          <Filter className="h-4 w-4" />
          Available Players
        </Button>
        <Button
          variant="outline"
          onClick={() => onFilterChange({ experience: 'all' })}
        >
          All Experience Levels
        </Button>
        <Button
          variant="outline"
          onClick={() => onFilterChange({
            achievements: true,
            status: 'all',
            experience: 'all'
          })}
        >
          With Achievements
        </Button>
      </div>
    </div>
  );
}
