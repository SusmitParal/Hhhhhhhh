import { Song, UserProfile } from '../types';
import { DEMO_TRACK_URL } from '../constants';

// List of available public JioSaavn API instances
const SAAVN_API_ENDPOINTS = [
    'https://saavn.dev/api',
    'https://jiosaavn-api-privatecvc2.vercel.app',
    'https://saavn.me' 
];

// Polyfill-like helper for Promise.any behavior (Fastest success wins)
const promiseAny = (promises: Promise<any>[]): Promise<any> => {
    return new Promise((resolve, reject) => {
        let errors: any[] = [];
        let rejectedCount = 0;
        
        if (promises.length === 0) reject(new Error("No promises"));

        promises.forEach(p => {
            p.then(resolve).catch(e => {
                errors.push(e);
                rejectedCount++;
                if (rejectedCount === promises.length) reject(errors);
            });
        });
    });
};

// Helper to try fetching from multiple endpoints in PARALLEL
async function fetchFromSaavnFastest(path: string): Promise<any> {
    const requests = SAAVN_API_ENDPOINTS.map(baseUrl => {
        return new Promise(async (resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout for reliability
            
            try {
                const res = await fetch(`${baseUrl}${path}`, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (!res.ok) throw new Error("Status not ok");
                
                const json = await res.json();
                // Validate data presence
                if (json.success || json.status === 'SUCCESS' || (json.data && json.data.results) || (json.results)) {
                    resolve(json);
                } else {
                    reject(new Error("Invalid data structure"));
                }
            } catch (e) {
                clearTimeout(timeoutId);
                reject(e);
            }
        });
    });

    try {
        return await promiseAny(requests);
    } catch (e) {
        throw new Error("All Saavn API endpoints failed");
    }
}

async function fetchFromSaavn(query: string, limit = 10): Promise<Song[]> {
  try {
    const json = await fetchFromSaavnFastest(`/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
    
    // Normalize response data structure
    const results = json.data?.results || json.results || json.data || [];

    if (!Array.isArray(results) || results.length === 0) {
        // Silent console log to avoid clutter
        return fetchFromItunes(query, limit);
    }

    return results.map((track: any) => {
        // IMAGE: extract highest quality
        let imageUrl = track.image?.[2]?.link || track.image?.[1]?.link || track.image?.[0]?.link;
        if (typeof track.image === 'string') imageUrl = track.image; 
        if (!imageUrl) imageUrl = `https://picsum.photos/300/300?random=${Math.random()}`;

        // AUDIO
        let bestAudio = '';
        if (Array.isArray(track.downloadUrl)) {
             const linkObj = track.downloadUrl.find((u: any) => u.quality === '320kbps') || 
                             track.downloadUrl.find((u: any) => u.quality === '160kbps') ||
                             track.downloadUrl[track.downloadUrl.length - 1];
             bestAudio = linkObj?.link || linkObj?.url || '';
        } else if (typeof track.downloadUrl === 'string') {
             bestAudio = track.downloadUrl;
        }
        if (!bestAudio && track.media_url) bestAudio = track.media_url;

        // Decode HTML
        const title = decodeHtml(track.name || track.title || "Unknown Song");
        const artist = decodeHtml(track.primaryArtists || track.singers || track.artist || "Unknown Artist");
        const album = decodeHtml(track.album?.name || track.album || "Single");

        return {
            id: track.id || `saavn_${Date.now()}_${Math.random()}`,
            title: title,
            artist: artist,
            album: album,
            coverUrl: imageUrl,
            duration: parseInt(track.duration) || 180,
            audioUrl: bestAudio || DEMO_TRACK_URL,
            previewUrl: bestAudio, 
            quality: 'High (320kbps)'
        };
    });
  } catch (e) {
    // console.error("Saavn API Error, falling back"); 
    return fetchFromItunes(query, limit);
  }
}

async function fetchFromItunes(query: string, limit = 10): Promise<Song[]> {
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=${limit}&entity=song`);
        const data = await res.json();
        return (data.results || []).map((track: any) => ({
            id: `itunes_${track.trackId}`,
            title: track.trackName,
            artist: track.artistName,
            album: track.collectionName || 'Single',
            coverUrl: track.artworkUrl100?.replace('100x100', '600x600'),
            duration: track.trackTimeMillis ? track.trackTimeMillis / 1000 : 180,
            audioUrl: track.previewUrl,
            previewUrl: track.previewUrl,
            quality: 'Preview (iTunes)'
        }));
    } catch (e) {
        return [getFallbackSong(query)];
    }
}

function decodeHtml(html: string) {
    if(!html) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

const getFallbackSong = (title: string): Song => ({
    id: `fallback_${Date.now()}_${Math.random()}`,
    title: title,
    artist: "System",
    album: 'Unknown',
    coverUrl: `https://picsum.photos/300/300?random=${Math.random()}`,
    duration: 180,
    audioUrl: DEMO_TRACK_URL
});

export const getHomeMixes = async (userProfile?: UserProfile) => {
    // Default base categories
    const categories = [
        { title: "Trending India", query: "Top 50 India", lang: 'Hindi' },
        { title: "Global Top 50", query: "Global Top 50", lang: 'English' },
        { title: "K-Pop World", query: "K-Pop Top 50", lang: 'Korean (K-Pop)' }, 
        { title: "Anime & J-Pop", query: "Anime Opening Songs", lang: 'Japanese (J-Pop/Anime)' },
        { title: "New Hindi Releases", query: "New Hindi Songs", lang: 'Hindi' },
        { title: "Punjabi Swag", query: "Top 50 Punjabi", lang: 'Punjabi' },
        { title: "Tamil Hits", query: "Top 50 Tamil", lang: 'Tamil' },
        { title: "Telugu Top 50", query: "Top 50 Telugu", lang: 'Telugu' },
        { title: "Marathi Hits", query: "Top 50 Marathi", lang: 'Marathi' },
        { title: "Gujarati Garba & Hits", query: "Top 50 Gujarati", lang: 'Gujarati' },
        { title: "Korean OST Magic", query: "Best Korean OST", lang: 'Korean (K-Pop)' },
        { title: "Bengali Beats", query: "Top 50 Bengali", lang: 'Bengali' },
        { title: "Kannada Charts", query: "Top 50 Kannada", lang: 'Kannada' },
        { title: "Malayalam Melodies", query: "Top 50 Malayalam", lang: 'Malayalam' },
        { title: "Bhojpuri Blasters", query: "Top 50 Bhojpuri", lang: 'Bhojpuri' },
        { title: "Haryanvi Hits", query: "Top 50 Haryanvi", lang: 'Haryanvi' },
    ];

    let finalCategories = [...categories];

    // --- PERSONALIZATION LOGIC ---
    if (userProfile) {
        // 1. Prioritize Artist Mixes
        const artistMixes = userProfile.artists.map(artist => ({
            title: `Best of ${artist}`,
            query: `${artist} Top Songs`
        }));

        // 2. Filter/Prioritize Languages
        if (userProfile.languages.length > 0) {
            // Sort categories: Put user languages first
            finalCategories.sort((a, b) => {
                const aMatch = userProfile.languages.some(l => a.lang === l);
                const bMatch = userProfile.languages.some(l => b.lang === l);
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });
            
            // Add custom language mixes if not present
            userProfile.languages.forEach(lang => {
                 // Clean up language name for search query (e.g. "Korean (K-Pop)" -> "K-Pop")
                 const simpleLang = lang.split('(')[0].trim();
                 if (!finalCategories.find(c => c.query.includes(simpleLang))) {
                     artistMixes.push({
                         title: `Top ${simpleLang} Hits`,
                         query: `Top 50 ${simpleLang}`
                     });
                 }
            });
        }
        
        // Add artist mixes to the TOP
        // Convert to compatible format
        const formattedArtistMixes = artistMixes.map(m => ({ ...m, lang: 'Any' }));
        finalCategories = [...formattedArtistMixes, ...finalCategories];
    }

    // Limit the number of categories to fetch to avoid rate limits, but prioritize top ones
    const mixesToFetch = finalCategories.slice(0, 10); 

    // Fetch in parallel
    const mixes = await Promise.all(mixesToFetch.map(async (cat) => {
        const songs = await fetchFromSaavn(cat.query, 20);
        return {
            title: cat.title,
            songs: songs.length > 0 ? songs : []
        };
    }));

    return mixes.filter(m => m.songs.length > 0);
};

export const searchTracks = async (query: string): Promise<Song[]> => {
    return fetchFromSaavn(query, 20);
};

// --- AUTO DISCOVERY FEATURE ---

const DISCOVERY_QUERIES = [
    "Trending Reels 2024", "Viral Hits India", "Coke Studio Season 15",
    "Arijit Singh Latest", "Sidhu Moose Wala", "Diljit Dosanjh",
    "Old Bollywood Classics", "K-Pop Hot 100", "Drake Hits", "The Weeknd",
    "LoFi Study Beats", "Meditation & Yoga", "Gym Motivation Hindi",
    "Punjabi Party Anthems", "Romantic Hits 2024", "Top English Pop",
    "Imagine Dragons", "Coldplay", "A.R. Rahman Magic", "Retro 90s India",
    "Garba Hits", "Tollywood Mass Beats", "Sufi Nights",
    "K-Pop New Releases", "Japanese City Pop", "Studio Ghibli LoFi", "Blackpink Solo", "NewJeans", "Twice Hits"
];

export const getDiscoverMix = async (userProfile?: UserProfile) => {
    let query = "";
    
    // Personalize discovery if profile exists
    if (userProfile && Math.random() > 0.3) { // 70% chance to use profile preference
        const type = Math.random() > 0.5 ? 'artist' : 'lang';
        
        if (type === 'artist' && userProfile.artists.length > 0) {
            const artist = userProfile.artists[Math.floor(Math.random() * userProfile.artists.length)];
            query = `${artist} radio`;
        } else if (type === 'lang' && userProfile.languages.length > 0) {
             const lang = userProfile.languages[Math.floor(Math.random() * userProfile.languages.length)];
             const simpleLang = lang.split('(')[0].trim();
             query = `Trending ${simpleLang} songs`;
        }
    }

    if (!query) {
        const randomIndex = Math.floor(Math.random() * DISCOVERY_QUERIES.length);
        query = DISCOVERY_QUERIES[randomIndex];
    }
    
    const songs = await fetchFromSaavn(query, 12);
    
    let title = query;
    if(title.includes("Trending") || title.includes("Viral")) title = "🔥 " + title;
    else if(title.includes("LoFi") || title.includes("Ghibli")) title = "🌙 " + title;
    else if(title.includes("Party") || title.includes("Gym")) title = "⚡ " + title;
    else if(title.includes("K-Pop") || title.includes("Anime")) title = "🌸 " + title;
    else title = "✨ " + title;

    return {
        title: title,
        songs: songs
    };
};