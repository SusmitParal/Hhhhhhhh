import React from 'react';
import { X, Play } from 'lucide-react';
import { Song } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentSong: Song | null;
  onPlay: (song: Song) => void;
}

export const QueueDrawer: React.FC<Props> = ({ isOpen, onClose, queue, currentSong, onPlay }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-[#121212] border-l border-[#282828] z-30 flex flex-col shadow-2xl transition-transform">
      <div className="p-4 flex items-center justify-between border-b border-[#282828]">
        <h2 className="text-lg font-bold text-white">Queue</h2>
        <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSong && (
            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-400 mb-2">Now Playing</h3>
                <div className="flex items-center gap-3 p-2 bg-[#282828] rounded-md">
                   <img src={currentSong.coverUrl} className="w-10 h-10 rounded" alt="" />
                   <div className="overflow-hidden">
                       <p className="font-bold text-green-500 truncate text-sm">{currentSong.title}</p>
                       <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
                   </div>
                   <div className="ml-auto w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
            </div>
        )}

        <div>
            <h3 className="text-sm font-bold text-gray-400 mb-2">Next Up</h3>
            {queue.length === 0 && <p className="text-gray-500 text-sm">Queue is empty</p>}
            <div className="space-y-2">
                {queue.map((song, i) => (
                    <div 
                        key={i} 
                        className="flex items-center gap-3 p-2 hover:bg-[#282828] rounded group cursor-pointer"
                        onClick={() => onPlay(song)}
                    >
                        <span className="text-gray-500 text-xs w-4">{i+1}</span>
                        <img src={song.coverUrl} className="w-8 h-8 rounded opacity-80 group-hover:opacity-100" alt="" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate group-hover:text-green-500">{song.title}</p>
                            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
