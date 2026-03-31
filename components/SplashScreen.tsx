import React, { useEffect, useState } from 'react';
import { Music4 } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 3.5s
    const timer = setTimeout(() => {
      setExiting(true);
      // Unmount after exit animation (0.5s)
      setTimeout(onComplete, 800); 
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#0f0518] flex flex-col items-center justify-center transition-opacity duration-700 ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#d946ef] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#22d3ee] rounded-full blur-[120px] opacity-20 animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8 animate-in zoom-in duration-1000 ease-out">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#d946ef] to-[#22d3ee] flex items-center justify-center shadow-[0_0_50px_rgba(217,70,239,0.5)]">
                 <Music4 size={64} className="text-white drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            {/* Orbit rings */}
            <div className="absolute inset-[-10px] border-2 border-[#d946ef]/30 rounded-full animate-spin-slow" style={{ animationDuration: '8s' }}></div>
            <div className="absolute inset-[-20px] border border-[#22d3ee]/20 rounded-full animate-reverse-spin" style={{ animationDuration: '12s' }}></div>
        </div>

        {/* Text */}
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e879f9] to-[#22d3ee] mb-4 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">
          HARMONIX
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 tracking-[0.5em] uppercase font-light animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-700">
          Feel The Beats
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 animate-in fade-in duration-1000 delay-1000">
          <p className="text-[#22d3ee] text-xs font-bold tracking-widest opacity-80 text-center">
              Powered by <span className="text-white drop-shadow-[0_0_5px_white]">ATHER-X PRO</span>
          </p>
      </div>

      <style>{`
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow linear infinite;
        }
        .animate-reverse-spin {
            animation: spin-slow linear infinite reverse;
        }
      `}</style>
    </div>
  );
};