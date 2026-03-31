import { GoogleGenAI, Type } from "@google/genai";
import { Song, Playlist, ArtistInfo } from "../types";
import { DEMO_TRACK_URL } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateLyrics = async (song: string, artist: string): Promise<string> => {
  if (!apiKey) return "Lyrics unavailable (API Key missing).";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate synchronized style lyrics for the song "${song}" by "${artist}". Format nicely with stanzas.`,
    });
    return response.text || "Lyrics not found.";
  } catch (e) {
    console.error("Gemini Error:", e);
    return "Could not load lyrics.";
  }
};

export const smartReorderQueue = async (currentSong: Song, queue: Song[]): Promise<Song[]> => {
    if (!apiKey || queue.length < 3) return queue.sort(() => Math.random() - 0.5);

    try {
        const songList = queue.map(s => `${s.title} - ${s.artist}`).join('\n');
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `I am listening to "${currentSong.title}" by "${currentSong.artist}". 
            Here is a list of upcoming songs:
            ${songList}
            
            Reorder this list to create the best musical flow/vibe continuing from the current song. 
            Return the song titles in the new order as a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const orderedTitles = JSON.parse(response.text || "[]");
        
        // Reconstruct queue based on returned titles
        const newQueue: Song[] = [];
        orderedTitles.forEach((title: string) => {
            const found = queue.find(s => title.includes(s.title) || s.title.includes(title));
            if (found && !newQueue.includes(found)) {
                newQueue.push(found);
            }
        });
        
        // Add any leftovers that weren't matched
        queue.forEach(s => {
            if (!newQueue.includes(s)) newQueue.push(s);
        });

        return newQueue;
    } catch (e) {
        console.error("AI Shuffle Error:", e);
        return queue.sort(() => Math.random() - 0.5);
    }
};

export const getArtistBio = async (artistName: string): Promise<ArtistInfo> => {
  if (!apiKey) {
      return { 
          name: artistName, 
          bio: "Bio unavailable in demo mode.", 
          imageUrl: `https://picsum.photos/400/400?random=${Math.random()}`,
          topTracks: generateMockSongs().slice(0, 3)
      };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short biography (under 100 words) for music artist "${artistName}" and a list of their 3 top hits. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bio: { type: Type.STRING },
            topHits: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        album: { type: Type.STRING }
                    }
                }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const topTracks: Song[] = (data.topHits || []).map((hit: any, i: number) => ({
        id: `artist_top_${i}_${Date.now()}`,
        title: hit.title,
        artist: artistName,
        album: hit.album || 'Greatest Hits',
        coverUrl: `https://picsum.photos/300/300?random=${Math.random()}`,
        duration: 200,
        audioUrl: DEMO_TRACK_URL
    }));

    return {
        name: artistName,
        bio: data.bio || "No bio available.",
        imageUrl: `https://picsum.photos/500/500?random=${Math.random()}`,
        topTracks
    };
  } catch (e) {
      return { 
          name: artistName, 
          bio: "Could not fetch bio.", 
          imageUrl: `https://picsum.photos/400/400?random=${Math.random()}`,
          topTracks: []
      };
  }
}

export const generateRecommendations = async (context: string): Promise<Song[]> => {
  if (!apiKey) return generateMockSongs();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a list of 6 songs for the category/mood: "${context}". Focus on Hindi and English songs (Old and New). Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              album: { type: Type.STRING },
            },
            propertyOrdering: ["title", "artist", "album"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    return data.map((item: any, idx: number) => ({
      id: `gen_${idx}_${Date.now()}_${Math.random()}`,
      title: item.title,
      artist: item.artist,
      album: item.album,
      coverUrl: `https://picsum.photos/300/300?random=${Math.random()}`,
      duration: 180 + Math.floor(Math.random() * 60),
      audioUrl: DEMO_TRACK_URL 
    }));

  } catch (e) {
    console.error("Gemini Recs Error:", e);
    return generateMockSongs();
  }
};

export const searchMusic = async (query: string): Promise<Song[]> => {
   // Re-using musicAPI instead for real search, this was Gemini mock
   return generateMockSongs();
}

const generateMockSongs = (): Song[] => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `mock_${i}`,
    title: `Song Title ${i + 1}`,
    artist: `Artist ${i + 1}`,
    album: `Album ${i + 1}`,
    coverUrl: `https://picsum.photos/300/300?random=${i}`,
    duration: 200,
    audioUrl: DEMO_TRACK_URL
  }));
};
