import React, { useEffect, useState } from 'react';
import { generateLyrics } from '../services/geminiService';
import { Song } from '../types';

interface Props {
  song: Song;
  className?: string;
}

export const LyricsView: React.FC<Props> = ({ song, className = '' }) => {
  const [lyrics, setLyrics] = useState("Loading lyrics...");

  useEffect(() => {
    setLyrics("Loading neon verses...");
    generateLyrics(song.title, song.artist).then(setLyrics);
  }, [song]);

  return (
    <div className={`w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#d946ef] scrollbar-track-transparent p-4 ${className}`}>
      <div className="text-center mb-6">
         <h2 className="text-2xl font-bold text-white drop-shadow-md">{song.title}</h2>
         <p className="text-[#22d3ee] font-medium">{song.artist}</p>
      </div>

      <div className="text-xl md:text-2xl font-semibold leading-relaxed text-white/90 whitespace-pre-wrap text-center drop-shadow-md">
        {lyrics}
      </div>
      
      <div className="h-20"></div> {/* Bottom spacer for scroll */}
    </div>
  );
};