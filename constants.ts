import { Song, Playlist, FriendActivity } from './types';

// A royalty-free track for demo purposes
export const DEMO_TRACK_URL = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

export const DEFAULT_EQ_PRESETS = {
  flat: [0, 0, 0, 0, 0, 0],
  bassBoost: [8, 6, 3, 0, 2, 4],
  trebleBoost: [-2, 0, 2, 5, 8, 10],
  vocal: [-2, -1, 4, 6, 3, 2],
};

export const MOCK_FRIENDS: FriendActivity[] = [
  { id: '1', name: 'Alice M.', avatarUrl: 'https://picsum.photos/50/50?random=1', currentSong: 'Neon Nights', artist: 'The Midnight', timestamp: '2m ago' },
  { id: '2', name: 'Bob D.', avatarUrl: 'https://picsum.photos/50/50?random=2', currentSong: 'Levitating', artist: 'Dua Lipa', timestamp: '1hr ago' },
  { id: '3', name: 'Charlie', avatarUrl: 'https://picsum.photos/50/50?random=3', currentSong: 'Master of Puppets', artist: 'Metallica', timestamp: 'Just now' },
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Discover Weekly',
    description: 'Your weekly mixtape of fresh music.',
    coverUrl: 'https://picsum.photos/300/300?random=10',
    songs: []
  },
  {
    id: 'p2',
    name: 'Release Radar',
    description: 'Catch up on the latest releases.',
    coverUrl: 'https://picsum.photos/300/300?random=11',
    songs: []
  },
  {
    id: 'p3',
    name: 'On Repeat',
    description: 'Songs you love right now.',
    coverUrl: 'https://picsum.photos/300/300?random=12',
    songs: []
  }
];

export const GENRES = [
  'Bollywood', 'Punjabi', 'K-Pop', 'J-Pop', 'Anime', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Bengali', 'Kannada', 'Malayalam', 'Bhojpuri', 'Indie India', 'Pop', 'Hip-Hop', 'Electronic', 'Rock', 'Classical', 'Ghazal', 'Devotional'
];

export const LANGUAGES = [
    'Hindi', 'English', 'Punjabi', 'Korean (K-Pop)', 'Japanese (J-Pop/Anime)', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Marathi', 'Gujarati', 'Bengali', 'Bhojpuri', 'Haryanvi', 'Spanish'
];

export const POPULAR_ARTISTS = [
    'Arijit Singh', 'BTS', 'Taylor Swift', 'The Weeknd', 'Drake', 'Diljit Dosanjh', 'Blackpink', 'Sidhu Moose Wala', 'Shreya Ghoshal', 'Badshah', 'Justin Bieber', 'Eminem', 'A.R. Rahman', 'Anirudh Ravichander', 'Pritam', 'Atif Aslam', 'Post Malone', 'Imagine Dragons', 'NewJeans', 'Twice'
];