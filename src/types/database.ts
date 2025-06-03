export interface UserProfile {  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  teams: string[]; // Array of team IDs
  leagues: string[]; // Array of league IDs
  connections: string[]; // Array of connected user IDs
  pendingRequests: string[]; // Array of user IDs who have sent connection requests
  sentRequests: string[]; // Array of user IDs to whom this user has sent connection requests
  postViews: number;
  sports: string[]; // Array of sports the user plays
  currentTeam?: string; // Current team ID if any
  sportsAccounts?: { // Social media or sports-related accounts
    [platform: string]: string;
  };
  createdAt: Date | { toDate(): Date };
  updatedAt: Date | { toDate(): Date };
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  sport: string;
  members: {
    [userId: string]: 'owner' | 'admin' | 'player';
  };
  leagueIds: string[];
  wins: number;
  losses: number;
  draws: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface League {
  id: string;
  name: string;
  description?: string;
  sport: string;
  teams: string[]; // Array of team IDs
  status: 'upcoming' | 'active' | 'completed';
  schedule: Match[];
  startDate: Date;
  endDate: Date;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  leagueId: string;
  homeTeam: {
    id: string;
    score: number;
  };
  awayTeam: {
    id: string;
    score: number;
  };
  status: 'scheduled' | 'live' | 'completed';
  startTime: Date;
  location?: string;
  highlights?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName?: string;
  authorPhotoURL?: string;
  likes: number;
  comments: Comment[];
  createdAt: Date | { toDate(): Date };
  updatedAt: Date | { toDate(): Date };
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}
