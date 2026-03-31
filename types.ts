
export type SpatialMode = 'off' | '8d' | '16d' | '32d';
export type ShuffleMode = 'off' | 'normal' | 'ai';
export type RepeatMode = 'off' | 'all' | 'one';

export interface UserProfile {
  name: string;
  age: string;
  dob: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  languages: string[];
  artists: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  audioUrl?: string; // Full length audio URL
  previewUrl?: string; // Keeping for compatibility
  isLocal?: boolean;
  quality?: string;
}

export interface Playlist {
  id: string;
  name: string;
  coverUrl: string;
  description: string;
  songs: Song[];
}

export interface ArtistInfo {
  name: string;
  bio: string;
  imageUrl: string;
  topTracks: Song[];
}

export type ViewState = 'home' | 'search' | 'liked-songs' | 'profile' | 'library' | 'lyrics' | 'settings' | 'play-together' | 'downloads';

export interface EQBand {
  frequency: number;
  gain: number; // -12 to 12
  type: 'lowshelf' | 'peaking' | 'highshelf';
}

export interface FriendActivity {
  id: string;
  name: string;
  avatarUrl: string;
  currentSong: string;
  artist: string;
  timestamp: string;
}
