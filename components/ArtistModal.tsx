import React, { useEffect, useState } from 'react';
import { X, Play } from 'lucide-react';
import { Song, ArtistInfo } from '../types';
import { getArtistBio } from '../services/geminiService';

interface Props {
  artistName: string;
  onClose: () => void;
  onPlaySong: (song: Song) => void;
}

export const ArtistModal: React.FC<Props> = ({ artistName, onClose, onPlaySong }) => {
  const [info, setInfo] = useState<ArtistInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getArtistBio(artistName).then(data => {
        setInfo(data);
        setLoading(false);
    });
  }, [artistName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#181818] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-white/20 transition">
            <X className="text-white" />
        </button>

        {loading ? (
            <div className="h-96 flex items-center justify-center text-white">Loading Artist Info...</div>
        ) : info ? (
            <div>
                {/* Header Image */}
                <div className="h-64 md:h-80 w-full relative">
                    <img src={info.imageUrl} className="w-full h-full object-cover opacity-60" alt={info.name} />
                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#181818] to-transparent">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">{info.name}</h1>
                        <p className="text-gray-300 max-w-2xl text-sm md:text-base font-medium">Verified Artist</p>
                    </div>
                </div>

                <div className="p-8">
                    {/* Bio */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Biography</h2>
                        <p className="text-gray-300 leading-relaxed text-lg">{info.bio}</p>
                    </div>

                    {/* Top Songs */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Top Hits</h2>
                        <div className="space-y-2">
                            {info.topTracks.map((song, idx) => (
                                <div 
                                    key={song.id}
                                    onClick={() => onPlaySong(song)}
                                    className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-md cursor-pointer group transition"
                                >
                                    <span className="text-gray-400 w-4 text-center">{idx + 1}</span>
                                    <img src={song.coverUrl} className="w-12 h-12 rounded shadow" alt="" />
                                    <div className="flex-1">
                                        <p className="font-bold text-white group-hover:text-green-500 transition">{song.title}</p>
                                        <p className="text-sm text-gray-400">{song.album}</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 bg-green-500 rounded-full text-black shadow-lg hover:scale-105 transition">
                                        <Play size={16} fill="black" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="p-8 text-center text-red-400">Failed to load artist info.</div>
        )}
      </div>
    </div>
  );
};
