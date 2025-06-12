export interface UserProfile {  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  displayNameLower: string;  // Lowercase version of displayName for case-insensitive search
  photoURL?: string;
  bannerURL?: string;  // User's profile banner image URL
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
  accountType?: 'team' | 'athlete'; // Add accountType property
  
  // Player performance stats
  position?: string;
  matchesPlayed?: number;
  Goals?: number;
  assist?: number;
  MVPs?: number;
  Saves?: number;
  wins?: number;
  losses?: number;
  clean_sheets?: number;
  rankScore?: number;
  
  // Player achievements
  achievements?: {
    title: string;
    description: string;
    year: string;
  }[];
  
  // Team-specific fields
  userType?: 'team' | 'player' | 'league'; // Add 'league' as a valid userType
  teamInfo?: {
    logo?: string;
    wins: number;
    losses: number;
    draws: number;
    players: TeamPlayer[];
    matchesPlayed: number;
    league?: string;
    clean_sheets?: number;
    recruiterInfo?: {
      openPositions: string[];
      requirements: string[];
    };
    location?: string;
  };
  
  // League-specific fields
  leagueInfo?: {
    teamsCount: number;
    currentSeason: string;
    pointsSystem: {
      win: number;
      draw: number;
      loss: number;
    };
    // Add other league-specific fields as needed
  };
}

export interface TeamPlayer {
  id: string;
  name: string;
  position: string;
  number?: number;
  joinDate: Date | { toDate(): Date };
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  logo?: string;
}

export type SportType = 'football' | 'cricket' | 'basketball' | 'hockey';

export interface League {
  id: string;
  name: string;
  sport: SportType;
  teams: string[];
}

export interface Match {
  id: string;
  teamIds: string[];
  status: 'scheduled' | 'live' | 'completed';
  score: {
    home: number;
    away: number;
  };
  startTime: Date | { toDate(): Date };
  location?: string;
  leagueId?: string;
  creatorId: string;
  createdAt: Date | { toDate(): Date };
  updatedAt: Date | { toDate(): Date };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date | { toDate(): Date };
  updatedAt: Date | { toDate(): Date };
  senderName?: string;
  senderPhotoURL?: string;
  receiverName?: string;
  receiverPhotoURL?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date | { toDate(): Date };
  authorName?: string; // Add authorName
  authorPhotoURL?: string; // Add authorPhotoURL
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date | { toDate(): Date };
  updatedAt: Date | { toDate(): Date };
  imageUrl?: string; // Add imageUrl
  likes: number; // Add likes
  likedBy: string[]; // Add likedBy
  comments: Comment[]; // Add comments
  authorName?: string; // Add authorName
  authorPhotoURL?: string; // Add authorPhotoURL
}

export interface Application {
  id?: string; // Firestore document ID
  applicantId: string; // User ID (athlete or team)
  applicantType: 'player' | 'team';
  targetTeamId?: string; // Optional: If applying to a specific team
  targetTeamName?: string; // Optional: If applying to a specific team by name
  targetLeagueId?: string; // Optional: If applying to a specific league
  targetLeagueName?: string; // Optional: If applying to a specific league by name
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date | { toDate(): Date };
}
