import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { Song } from '../types';
import { audioEngine } from '../services/audioEngine';

interface Props {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: (e: React.MouseEvent) => void;
  isLiked: boolean;
  onToggleLike: (e: React.MouseEvent) => void;
  onExpand: () => void;
}

export const PlayerBar: React.FC<Props> = ({ 
  currentSong, isPlaying, onPlayPause, isLiked, onToggleLike, onExpand
}) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      setProgress(audioEngine.currentTime);
      setDuration(audioEngine.duration || currentSong?.duration || 100);
    };
    audioEngine.onTimeUpdate(updateTime);
  }, [currentSong]);

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div 
      onClick={onExpand}
      className="h-[72px] bg-[#1e0b24]/90 backdrop-blur-xl border-t border-[#d946ef]/30 px-2 flex items-center justify-between z-40 relative select-none cursor-pointer group hover:bg-[#2a0f35] transition-colors"
    >
      {/* Tiny Progress Bar at Top - Neon Gradient */}
      <div className="absolute top-0 left-0 h-[3px] bg-gray-800 w-full">
         <div 
           className="h-full bg-gradient-to-r from-[#22d3ee] to-[#d946ef] transition-all duration-300 ease-linear shadow-[0_0_10px_#d946ef]"
           style={{ width: `${progressPercent}%` }}
         />
      </div>

      <div className="flex items-center gap-3 flex-1 min-w-0 px-2">
        <div className="relative">
            <img 
                src={currentSong.coverUrl} 
                alt="cover" 
                className="h-12 w-12 rounded shadow-lg object-cover border border-white/10" 
            />
            {isPlaying && (
                <div className="absolute inset-0 border-2 border-[#d946ef] rounded animate-pulse"></div>
            )}
        </div>
        <div className="flex-1 overflow-hidden">
            <div className="text-white font-bold text-sm truncate drop-shadow-md">
            {currentSong.title}
            </div>
            <div className="text-[#22d3ee] text-xs truncate font-medium">
            {currentSong.artist}
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-2">
         <button 
            onClick={(e) => { e.stopPropagation(); onToggleLike(e); }}
            className={`transition ${isLiked ? 'text-[#d946ef]' : 'text-gray-400 hover:text-white'}`}
         >
             <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "drop-shadow-[0_0_8px_#d946ef]" : ""} />
         </button>

         <button 
            onClick={(e) => { e.stopPropagation(); onPlayPause(e); }}
            className="bg-gradient-to-br from-[#d946ef] to-[#22d3ee] rounded-full p-2 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)] hover:scale-105 transition-transform"
         >
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
         </button>
      </div>
    </div>
  );
};