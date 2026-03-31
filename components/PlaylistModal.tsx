import React, { useState } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { Playlist, Song } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylist: (name: string) => void;
  song: Song | null;
}

export const PlaylistModal: React.FC<Props> = ({ 
  isOpen, onClose, playlists, onAddToPlaylist, onCreatePlaylist, song 
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !song) return null;

  const handleCreate = () => {
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#181818] rounded-xl w-full max-w-md border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Add to Playlist</h2>
          <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
        </div>
        
        <div className="p-4">
            <div className="flex items-center gap-3 mb-6 p-2 bg-white/5 rounded-lg">
                <img src={song.coverUrl} className="w-12 h-12 rounded" alt="" />
                <div className="overflow-hidden">
                    <div className="font-bold text-white truncate">{song.title}</div>
                    <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-600">
                <button 
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition text-left group"
                >
                    <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center group-hover:bg-green-500 transition">
                        <Plus size={24} className="text-white group-hover:text-black" />
                    </div>
                    <span className="font-medium text-white">New Playlist</span>
                </button>

                {isCreating && (
                    <div className="p-2 bg-white/5 rounded-lg mb-2 animate-in fade-in slide-in-from-top-2">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Playlist Name" 
                            className="w-full bg-[#222] text-white px-3 py-2 rounded border border-gray-600 focus:border-green-500 outline-none text-sm mb-2"
                            value={newPlaylistName}
                            onChange={e => setNewPlaylistName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-xs text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleCreate} className="px-3 py-1 bg-green-500 text-black text-xs font-bold rounded hover:bg-green-400">Create</button>
                        </div>
                    </div>
                )}

                {playlists.map(pl => (
                    <button 
                        key={pl.id}
                        onClick={() => onAddToPlaylist(pl.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-left"
                    >
                        <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                            {pl.coverUrl ? (
                                <img src={pl.coverUrl} className="w-full h-full object-cover" />
                            ) : (
                                <Music size={20} className="text-gray-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-white">{pl.name}</div>
                            <div className="text-xs text-gray-400">{pl.songs.length} songs</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
