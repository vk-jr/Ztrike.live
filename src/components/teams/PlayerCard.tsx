'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Star, Award, ChartBar, Medal, Shield, TrendingUp } from "lucide-react";

interface PlayerStats {
  Goals?: number;
  assist?: number;
  MVPs?: number;
  Saves?: number;
  matches_played?: number;
  wins?: number;
  losses?: number;
  clean_sheets?: number;
  athletic?: string;
  runs?: number;
  wickets?: number;
  centuries?: number;
  points?: number;
  rebounds?: number;
  blocks?: number;
  steals?: number;
  rankScore?: number; // Added rankScore to the interface
}

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    position?: string;
    athletic?: string;
    experience?: string;
    achievements?: string[];
    status?: 'available' | 'in-talks' | 'recruited';
    rankScore?: number; // Added rankScore to the player prop
  } & PlayerStats;
  onRecruit: (playerId: string) => void;
}

export function PlayerCard({ player, onRecruit }: PlayerCardProps) {
  const statusColors = {
    'available': 'bg-green-100 text-green-700',
    'in-talks': 'bg-yellow-100 text-yellow-700',
    'recruited': 'bg-blue-100 text-blue-700',
  };

  const getMainStats = () => {
    if (!player.athletic || !player.position) return [];

    const stats: { label: string; value: number | undefined; icon: JSX.Element }[] = [];
    
    switch (player.athletic.toLowerCase().trim()) {
      case 'football':
        // Always add Goals, Assists, MVPs for football players
        stats.push(
          { label: 'Goals', value: player.Goals, icon: <ChartBar className="w-4 h-4" /> },
          { label: 'Assists', value: player.assist, icon: <Award className="w-4 h-4" /> },
          { label: 'MVPs', value: player.MVPs, icon: <Medal className="w-4 h-4" /> }
        );

        if (player.position.toLowerCase().includes('goalkeeper')) {
          stats.push(
            { label: 'Saves', value: player.Saves, icon: <Shield className="w-4 h-4" /> },
            { label: 'Clean Sheets', value: player.clean_sheets, icon: <Award className="w-4 h-4" /> }
          );
        }
        break;
      case 'cricket':
        if (player.position.toLowerCase().includes('batsman')) {
          stats.push(
            { label: 'Runs', value: player.runs, icon: <ChartBar className="w-4 h-4" /> },
            { label: 'Centuries', value: player.centuries, icon: <Medal className="w-4 h-4" /> }
          );
        } else if (player.position.toLowerCase().includes('bowler')) {
          stats.push(
            { label: 'Wickets', value: player.wickets, icon: <Award className="w-4 h-4" /> }
          );
        }
        break;
      case 'basketball':
        stats.push(
          { label: 'Points', value: player.points, icon: <ChartBar className="w-4 h-4" /> }
        );
        if (player.position.toLowerCase().includes('guard')) {
          stats.push(
            { label: 'Assists', value: player.assist, icon: <Award className="w-4 h-4" /> },
            { label: 'Steals', value: player.steals, icon: <Shield className="w-4 h-4" /> }
          );
        } else {
          stats.push(
            { label: 'Rebounds', value: player.rebounds, icon: <Award className="w-4 h-4" /> },
            { label: 'Blocks', value: player.blocks, icon: <Shield className="w-4 h-4" /> }
          );
        }
        break;
      case 'hockey':
        if (player.position.toLowerCase().includes('forward')) {
          stats.push(
            { label: 'Goals', value: player.Goals, icon: <ChartBar className="w-4 h-4" /> },
            { label: 'Assists', value: player.assist, icon: <Award className="w-4 h-4" /> }
          );
        } else if (player.position.toLowerCase().includes('goalkeeper')) {
          stats.push(
            { label: 'Saves', value: player.Saves, icon: <Shield className="w-4 h-4" /> },
            { label: 'Clean Sheets', value: player.clean_sheets, icon: <Award className="w-4 h-4" /> }
          );
        }
        break;
    }

    // Add matches played if available
    if (player.matches_played) {
      stats.push({ label: 'Matches', value: player.matches_played, icon: <Medal className="w-4 h-4" /> });
    }

    return stats;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{player.name}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600 font-medium">{player.position}</span>
                {player.athletic && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{player.athletic}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {player.status && (
            <Badge className={`${statusColors[player.status]} capitalize`}>
              {player.status}
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {getMainStats().map((stat, index) => (
            stat.value !== undefined && (
              <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-full text-blue-600">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="font-semibold text-gray-900">{stat.value}</div>
                </div>
              </div>
            )
          ))}
           {/* Display Rank Score */}
          {player.rankScore !== undefined && (
            <div className="bg-yellow-50 rounded-lg p-3 flex items-center gap-2 col-span-2">
               <div className="p-1.5 bg-yellow-100 rounded-full text-yellow-600">
                 <TrendingUp className="w-4 h-4" />
               </div>
               <div>
                 <div className="text-sm text-gray-500">Rank Score</div>
                 <div className="font-semibold text-gray-900">{player.rankScore.toFixed(2)}</div>
               </div>
            </div>
          )}
        </div>

        {player.experience && (
          <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
            <p>{player.experience}</p>
          </div>
        )}

        {player.achievements && player.achievements.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {player.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{achievement}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={() => onRecruit(player.id)} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Start Recruitment
        </Button>
      </CardContent>
    </Card>
  );
}
