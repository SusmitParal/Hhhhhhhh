import React, { useState } from 'react';
import { ChevronRight, Check, User, Music2, Mic2 } from 'lucide-react';
import { UserProfile } from '../types';
import { LANGUAGES, POPULAR_ARTISTS } from '../constants';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    dob: '',
    gender: 'prefer-not-to-say',
    languages: [],
    artists: []
  });

  const handleNext = () => {
    if (step === 1) {
        if (!profile.name || !profile.age || !profile.dob) return;
    }
    setStep(s => s + 1);
  };

  const handleFinish = () => {
      onComplete(profile);
  };

  const toggleSelection = (list: string[], item: string, field: 'languages' | 'artists') => {
      const exists = list.includes(item);
      const newList = exists ? list.filter(i => i !== item) : [...list, item];
      setProfile(prev => ({ ...prev, [field]: newList }));
  };

  return (
    <div className="fixed inset-0 z-[90] bg-[#0f0518] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
       <div className="w-full max-w-md relative">
          
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8 px-4">
              <div className={`h-1.5 flex-1 rounded-full mr-2 transition-all duration-500 ${step >= 1 ? 'bg-[#d946ef] shadow-[0_0_10px_#d946ef]' : 'bg-white/10'}`}></div>
              <div className={`h-1.5 flex-1 rounded-full mr-2 transition-all duration-500 ${step >= 2 ? 'bg-[#d946ef] shadow-[0_0_10px_#d946ef]' : 'bg-white/10'}`}></div>
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-[#d946ef] shadow-[0_0_10px_#d946ef]' : 'bg-white/10'}`}></div>
          </div>

          <div className="bg-[#1a0925]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col">
             
             {/* Background glow */}
             <div className="absolute top-[-50%] right-[-50%] w-64 h-64 bg-[#22d3ee] rounded-full blur-[100px] opacity-20 pointer-events-none animate-pulse"></div>
             <div className="absolute bottom-[-50%] left-[-50%] w-64 h-64 bg-[#d946ef] rounded-full blur-[100px] opacity-20 pointer-events-none animate-pulse delay-1000"></div>

             {step === 1 && (
                 <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
                     <div className="flex items-center gap-3 mb-6">
                         <div className="p-3 bg-gradient-to-br from-[#d946ef] to-[#9d174d] rounded-2xl text-white shadow-lg"><User size={24} /></div>
                         <div>
                             <h2 className="text-2xl font-bold text-white">Who are you?</h2>
                             <p className="text-gray-400 text-sm">Let's personalize your vibe.</p>
                         </div>
                     </div>
                     
                     <div className="space-y-5 flex-1">
                         <div>
                             <label className="text-[10px] text-[#d946ef] font-bold uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
                             <input 
                                type="text" 
                                value={profile.name}
                                onChange={e => setProfile({...profile, name: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#d946ef] focus:ring-1 focus:ring-[#d946ef] outline-none transition placeholder:text-gray-600 font-medium"
                                placeholder="e.g. Alex Carter"
                             />
                         </div>
                         <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] text-[#22d3ee] font-bold uppercase tracking-widest mb-1.5 block ml-1">Age</label>
                                <input 
                                    type="number" 
                                    value={profile.age}
                                    onChange={e => setProfile({...profile, age: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee] outline-none transition placeholder:text-gray-600 font-medium"
                                    placeholder="21"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-[#22d3ee] font-bold uppercase tracking-widest mb-1.5 block ml-1">DOB</label>
                                <input 
                                    type="date" 
                                    value={profile.dob}
                                    onChange={e => setProfile({...profile, dob: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee] outline-none transition text-sm font-medium"
                                />
                            </div>
                         </div>
                         <div>
                             <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block ml-1">Gender</label>
                             <select 
                                value={profile.gender}
                                onChange={e => setProfile({...profile, gender: e.target.value as any})}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3.5 text-white focus:border-white focus:ring-1 focus:ring-white outline-none transition font-medium appearance-none"
                             >
                                 <option value="prefer-not-to-say">Prefer not to say</option>
                                 <option value="male">Male</option>
                                 <option value="female">Female</option>
                                 <option value="other">Other</option>
                             </select>
                         </div>
                     </div>

                     <button 
                        onClick={handleNext}
                        disabled={!profile.name || !profile.age || !profile.dob}
                        className="w-full mt-6 bg-gradient-to-r from-[#d946ef] to-[#22d3ee] p-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                     >
                        Continue <ChevronRight size={20} />
                     </button>
                 </div>
             )}

             {step === 2 && (
                 <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
                     <div className="flex items-center gap-3 mb-6">
                         <div className="p-3 bg-gradient-to-br from-[#22d3ee] to-[#0e7490] rounded-2xl text-white shadow-lg"><Music2 size={24} /></div>
                         <div>
                             <h2 className="text-2xl font-bold text-white">Your Vibe?</h2>
                             <p className="text-gray-400 text-sm">Select languages you listen to.</p>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 flex-1 content-start">
                         {LANGUAGES.map(lang => {
                             const isSelected = profile.languages.includes(lang);
                             return (
                                 <button
                                    key={lang}
                                    onClick={() => toggleSelection(profile.languages, lang, 'languages')}
                                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-left flex justify-between items-center group ${isSelected ? 'bg-[#22d3ee] border-[#22d3ee] text-black shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-[1.02]' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                                 >
                                     {lang}
                                     {isSelected && <Check size={14} className="text-black" />}
                                 </button>
                             );
                         })}
                     </div>

                     <button 
                        onClick={handleNext}
                        className="w-full mt-6 bg-gradient-to-r from-[#22d3ee] to-[#d946ef] p-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
                     >
                        Next <ChevronRight size={20} />
                     </button>
                 </div>
             )}

             {step === 3 && (
                 <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
                     <div className="flex items-center gap-3 mb-6">
                         <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl text-white shadow-lg"><Mic2 size={24} /></div>
                         <div>
                             <h2 className="text-2xl font-bold text-white">Favorite Artists</h2>
                             <p className="text-gray-400 text-sm">We'll build your mix around them.</p>
                         </div>
                     </div>

                     <div className="flex flex-wrap gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 content-start flex-1">
                         {POPULAR_ARTISTS.map(artist => {
                             const isSelected = profile.artists.includes(artist);
                             return (
                                 <button
                                    key={artist}
                                    onClick={() => toggleSelection(profile.artists, artist, 'artists')}
                                    className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${isSelected ? 'bg-[#d946ef] border-[#d946ef] text-white shadow-[0_0_15px_#d946ef] scale-105' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30'}`}
                                 >
                                     {artist}
                                 </button>
                             );
                         })}
                     </div>

                     <button 
                        onClick={handleFinish}
                        className="w-full mt-6 bg-gradient-to-r from-[#d946ef] to-[#22d3ee] p-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
                     >
                        Create Profile <Check size={20} />
                     </button>
                 </div>
             )}

          </div>
          
          <p className="text-center text-gray-500 text-[10px] mt-6 tracking-widest uppercase">Powered by ATHER-X PRO</p>
       </div>
    </div>
  );
};