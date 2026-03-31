import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, Heart, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, 
  Layers, Download, Mic2, ListMusic, MoreHorizontal, Clock, MonitorSpeaker, Sparkles, Loader2, RefreshCw, Repeat1
} from 'lucide-react';
import { Song, SpatialMode, ArtistInfo, ShuffleMode, RepeatMode } from '../types';
import { audioEngine } from '../services/audioEngine';
import { getArtistBio } from '../services/geminiService';
import { EqualizerModal } from './EqualizerModal';
import { LyricsView } from './LyricsView';

interface Props {
  currentSong: Song;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  onToggleLyrics: () => void; // Kept for prop interface compatibility, but handled internally now
  onToggleQueue: () => void;
  
  shuffleMode: ShuffleMode;
  repeatMode: RepeatMode;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export const FullScreenPlayer: React.FC<Props> = ({
  currentSong, isPlaying, onPlayPause, onNext, onPrev, onClose,
  isLiked, onToggleLike, onToggleQueue,
  shuffleMode, repeatMode, onToggleShuffle, onToggleRepeat
}) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [spatialMode, setSpatialMode] = useState<SpatialMode>('off');
  const [artistBio, setArtistBio] = useState<ArtistInfo | null>(null);
  const [showEq, setShowEq] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  
  // Sleep Timer Local State for Display
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setProgress(audioEngine.currentTime);
      setDuration(audioEngine.duration || currentSong.duration || 0);
    };
    audioEngine.onTimeUpdate(updateTime);
    
    // Load Artist Bio if not showing lyrics
    if (!showLyrics) {
        setArtistBio(null);
        getArtistBio(currentSong.artist).then(setArtistBio);
    }
  }, [currentSong, showLyrics]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audioEngine.seek(time);
    setProgress(time);
  };

  const cycleSpatial = () => {
    const modes: SpatialMode[] = ['off', '8d', '16d', '32d'];
    const nextIdx = (modes.indexOf(spatialMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setSpatialMode(nextMode);
    audioEngine.setSpatialMode(nextMode);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSong.audioUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(currentSong.audioUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSong.title} - ${currentSong.artist}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Secure download failed, trying fallback", err);
      // Fallback: Open in new tab
      window.open(currentSong.audioUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const cycleTimer = () => {
      if (timerMinutes === null) {
          setTimerMinutes(15);
      } else if (timerMinutes === 15) {
          setTimerMinutes(30);
      } else if (timerMinutes === 30) {
          setTimerMinutes(60);
      } else {
          setTimerMinutes(null);
      }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#0f0518] flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
      <EqualizerModal isOpen={showEq} onClose={() => setShowEq(false)} />

      {/* Ambient Background */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none transition-colors duration-1000"
        style={{ 
            background: `radial-gradient(circle at 50% 30%, ${isPlaying ? '#d946ef' : '#4c1d95'}, #0f0518 80%)` 
        }}
      />
      {/* blurred cover background for depth */}
      <img 
        src={currentSong.coverUrl} 
        className="absolute inset-0 w-full h-full object-cover opacity-10 blur-3xl pointer-events-none" 
        alt="" 
      />

      {/* Header */}
      <div className="flex justify-between items-center p-6 z-10">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition">
          <ChevronDown size={28} />
        </button>
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#22d3ee] drop-shadow-[0_0_5px_#22d3ee]">
            {showLyrics ? 'LYRICS' : 'NOW PLAYING'}
          </span>
          <div className="font-bold text-xs truncate max-w-[150px] text-gray-300">{currentSong.album}</div>
        </div>
        <div className="flex gap-2">
            <button onClick={cycleTimer} className={`p-2 hover:bg-white/10 rounded-full transition ${timerMinutes ? 'text-[#22d3ee]' : 'text-gray-400'}`}>
                <Clock size={22} />
            </button>
            <button onClick={() => setShowEq(true)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                <MonitorSpeaker size={22} />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-2 z-10 max-w-2xl mx-auto w-full relative">
        
        {/* Center Stage: Album Art OR Lyrics */}
        <div className="w-full aspect-square max-w-sm mb-8 relative group perspective-1000">
          
          {!showLyrics ? (
            // ALBUM ART VIEW
            <div className="relative w-full h-full animate-in fade-in zoom-in duration-500">
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#22d3ee] to-[#d946ef] blur-xl opacity-40 group-hover:opacity-60 transition duration-700 ${isPlaying ? 'scale-105' : 'scale-95'}`}></div>
                <img 
                    src={currentSong.coverUrl} 
                    alt={currentSong.title} 
                    className={`relative w-full h-full object-cover rounded-3xl shadow-2xl z-10 ${isPlaying ? 'scale-100' : 'scale-95'} transition-transform duration-700 ease-in-out border border-white/10`} 
                />
            </div>
          ) : (
            // LYRICS VIEW
            <div className="relative w-full h-full rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <LyricsView song={currentSong} />
            </div>
          )}
          
        </div>

        {/* Title & Artist & Quick Actions */}
        <div className="w-full flex justify-between items-center mb-6 px-1">
           <div className="flex-1 overflow-hidden mr-4">
             <h1 className="text-2xl md:text-3xl font-bold truncate mb-1 text-white drop-shadow-lg">{currentSong.title}</h1>
             <p className="text-lg text-[#22d3ee] truncate font-medium drop-shadow-[0_0_3px_#22d3ee]">{currentSong.artist}</p>
           </div>
           
           <div className="flex items-center gap-2">
               <button 
                 onClick={handleDownload}
                 disabled={isDownloading}
                 className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white relative"
               >
                 {isDownloading ? <Loader2 size={24} className="animate-spin text-[#d946ef]" /> : <Download size={24} />}
               </button>

               <button 
                 onClick={onToggleLike} 
                 className={`p-3 rounded-full bg-white/5 hover:bg-white/10 transition ${isLiked ? 'text-[#d946ef]' : 'text-gray-400'}`}
               >
                 <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "drop-shadow-[0_0_8px_#d946ef]" : ""} />
               </button>
           </div>
        </div>

        {/* Neon Progress Bar */}
        <div className="w-full mb-6 group">
           <input 
              type="range" 
              min={0} 
              max={duration || 100} 
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#2a1a35] rounded-lg appearance-none cursor-pointer accent-[#d946ef] hover:accent-[#22d3ee] transition-colors shadow-[0_0_10px_#d946ef]"
           />
           <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium font-mono group-hover:text-white transition-colors">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
           </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between w-full max-w-sm mb-6 px-2">
           <button 
              onClick={onToggleShuffle} 
              className={`transition p-2 rounded-full hover:bg-white/5 ${shuffleMode !== 'off' ? 'text-[#d946ef] drop-shadow-[0_0_5px_#d946ef]' : 'text-gray-400 hover:text-white'}`}
              title={shuffleMode === 'ai' ? "AI Shuffle Active" : "Shuffle"}
           >
               {shuffleMode === 'ai' ? <Sparkles size={22} /> : <Shuffle size={22} />}
           </button>
           
           <button onClick={onPrev} className="text-white hover:scale-110 transition p-2 hover:text-[#22d3ee]"><SkipBack size={34} fill="currentColor" /></button>
           
           <button 
             onClick={onPlayPause}
             className="w-18 h-18 bg-gradient-to-br from-[#d946ef] to-[#22d3ee] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(217,70,239,0.6)] hover:scale-105 transition active:scale-95 text-white border-2 border-white/20"
             style={{ width: '72px', height: '72px' }}
           >
             {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
           </button>
           
           <button onClick={onNext} className="text-white hover:scale-110 transition p-2 hover:text-[#22d3ee]"><SkipForward size={34} fill="currentColor" /></button>
           
           <button 
              onClick={onToggleRepeat} 
              className={`transition p-2 rounded-full hover:bg-white/5 ${repeatMode !== 'off' ? 'text-[#d946ef] drop-shadow-[0_0_5px_#d946ef]' : 'text-gray-400 hover:text-white'}`}
           >
               {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
           </button>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-around w-full border-t border-white/5 pt-4 pb-8">
            <button 
                onClick={cycleSpatial} 
                className={`flex flex-col items-center gap-1.5 ${spatialMode !== 'off' ? 'text-[#22d3ee] drop-shadow-[0_0_5px_#22d3ee]' : 'text-gray-400 hover:text-white'} transition`}
            >
               <Layers size={22} />
               <span className="text-[10px] font-semibold tracking-wide">{spatialMode === 'off' ? 'STEREO' : spatialMode.toUpperCase()}</span>
            </button>
            
             <button 
                onClick={() => setShowLyrics(!showLyrics)} 
                className={`flex flex-col items-center gap-1.5 transition ${showLyrics ? 'text-[#d946ef] drop-shadow-[0_0_5px_#d946ef]' : 'text-gray-400 hover:text-white'}`}
             >
               <Mic2 size={22} />
               <span className="text-[10px] font-semibold tracking-wide">LYRICS</span>
            </button>
            
            <button onClick={onToggleQueue} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition">
               <ListMusic size={22} />
               <span className="text-[10px] font-semibold tracking-wide">QUEUE</span>
            </button>
        </div>

      </div>
    </div>
  );
};